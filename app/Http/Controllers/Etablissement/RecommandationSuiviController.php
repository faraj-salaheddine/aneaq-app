<?php

namespace App\Http\Controllers\Etablissement;

use App\Http\Controllers\Controller;
use App\Models\Dossier;
use App\Models\NotificationAneaq;
use App\Services\ActivityLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class RecommandationSuiviController extends Controller
{
    public function index(Dossier $dossier)
    {
        $this->autoriser($dossier);

        $recommandations = $this->getRecommandations($dossier->id);
        $preuves         = $this->getPreuves($dossier->id);

        return Inertia::render('Etablissement/Recommandations/Index', [
            'dossier'         => $dossier->only('id', 'reference'),
            'recommandations' => $recommandations,
            'preuves'         => $preuves,
        ]);
    }

    public function repondre(Request $request, Dossier $dossier, int $recommandation)
    {
        $this->autoriser($dossier);
        $r = $this->findOrFail($recommandation, $dossier->id);

        $request->validate([
            'reponse_etablissement' => 'required|string|max:3000',
            'delai_etablissement'   => 'required|date|after:today',
        ]);

        DB::table('recommandations_domaines')->where('id', $r->id)->update([
            'statut'                   => 'en_cours',
            'reponse_etablissement'    => $request->reponse_etablissement,
            'delai_etablissement'      => $request->delai_etablissement,
            'date_reponse_etablissement' => now(),
            'updated_at'               => now(),
        ]);

        $this->log($r->id, 'reponse_etablissement', 'etablissement', Auth::id(),
            "Délai : {$request->delai_etablissement}. " . $request->reponse_etablissement);

        ActivityLogger::log('recommandation_repondue', "Réponse fournie pour une recommandation du dossier {$dossier->reference}", $dossier);

        // Notifier DEE admins
        $this->notifierDee($dossier, "L'établissement a répondu à une recommandation du dossier {$dossier->reference}. Délai annoncé : {$request->delai_etablissement}.");

        return back()->with('success', 'Réponse enregistrée.');
    }

    public function uploaderPreuve(Request $request, Dossier $dossier, int $recommandation)
    {
        $this->autoriser($dossier);
        $r = $this->findOrFail($recommandation, $dossier->id);

        $request->validate([
            'fichier'     => 'required|file|max:10240|mimes:pdf,doc,docx,jpg,jpeg,png,xlsx,xls',
            'description' => 'nullable|string|max:500',
        ]);

        $file = $request->file('fichier');
        $path = $file->store("preuves/recommandations/{$dossier->id}", 'public');

        DB::table('recommandation_preuves')->insert([
            'recommandation_id' => $r->id,
            'fichier_path'      => $path,
            'fichier_nom'       => $file->getClientOriginalName(),
            'fichier_type'      => $file->getClientOriginalExtension(),
            'fichier_taille'    => $file->getSize(),
            'description'       => $request->description,
            'uploaded_by'       => Auth::id(),
            'created_at'        => now(),
            'updated_at'        => now(),
        ]);

        $this->log($r->id, 'reponse_etablissement', 'etablissement', Auth::id(),
            "Preuve déposée : " . $file->getClientOriginalName());

        ActivityLogger::log('preuve_recommandation_deposee', "Preuve déposée pour une recommandation du dossier {$dossier->reference}", $dossier);

        $this->notifierDee($dossier, "L'établissement a déposé une preuve pour une recommandation du dossier {$dossier->reference}.");

        return back()->with('success', 'Preuve déposée avec succès.');
    }

    public function supprimerPreuve(Dossier $dossier, int $preuve)
    {
        $this->autoriser($dossier);

        $p = DB::table('recommandation_preuves')
            ->join('recommandations_domaines', 'recommandation_preuves.recommandation_id', '=', 'recommandations_domaines.id')
            ->where('recommandation_preuves.id', $preuve)
            ->where('recommandations_domaines.dossier_id', $dossier->id)
            ->where('recommandation_preuves.uploaded_by', Auth::id())
            ->select('recommandation_preuves.*')
            ->first();

        abort_if(!$p, 404);

        Storage::disk('public')->delete($p->fichier_path);
        DB::table('recommandation_preuves')->where('id', $preuve)->delete();

        return back()->with('success', 'Preuve supprimée.');
    }

    // ─── Helpers ───────────────────────────────────────────────────────────

    private function autoriser(Dossier $dossier): void
    {
        $user  = Auth::user();
        $etab  = DB::table('etablissements')->where('user_id', $user->id)->first();
        abort_unless($etab && $etab->id === $dossier->etablissement_id, 403);
    }

    private function getRecommandations(int $dossierId): array
    {
        if (!Schema::hasTable('recommandations_domaines')) return [];
        return DB::table('recommandations_domaines')
            ->where('dossier_id', $dossierId)
            ->whereIn('statut', ['envoyee_etablissement', 'en_cours', 'cloturee'])
            ->orderBy('domaine_code')
            ->get()->map(fn($r) => (array) $r)->toArray();
    }

    private function getPreuves(int $dossierId): array
    {
        if (!Schema::hasTable('recommandation_preuves') || !Schema::hasTable('recommandations_domaines')) return [];
        return DB::table('recommandation_preuves')
            ->join('recommandations_domaines', 'recommandation_preuves.recommandation_id', '=', 'recommandations_domaines.id')
            ->where('recommandations_domaines.dossier_id', $dossierId)
            ->select('recommandation_preuves.*')
            ->orderByDesc('recommandation_preuves.created_at')
            ->get()->map(fn($p) => (array) $p)->toArray();
    }

    private function findOrFail(int $id, int $dossierId): object
    {
        $r = DB::table('recommandations_domaines')
            ->where('id', $id)->where('dossier_id', $dossierId)
            ->whereIn('statut', ['envoyee_etablissement', 'en_cours'])
            ->first();
        abort_if(!$r, 404);
        return $r;
    }

    private function log(int $rid, string $action, string $type, ?int $acteurId, ?string $commentaire): void
    {
        try {
            DB::table('suivi_recommandations_log')->insert([
                'recommandation_id' => $rid,
                'action'            => $action,
                'acteur_type'       => $type,
                'acteur_id'         => $acteurId,
                'commentaire'       => $commentaire,
                'created_at'        => now(),
                'updated_at'        => now(),
            ]);
        } catch (\Throwable) {}
    }

    private function notifierDee(Dossier $dossier, string $message): void
    {
        $admins = DB::table('users')->where('role', 'admin_dee')->get();
        foreach ($admins as $admin) {
            try {
                NotificationAneaq::envoyer($admin->id, 'general',
                    "Réponse établissement — {$dossier->reference}", $message, 'Dossier', $dossier->id);
            } catch (\Throwable) {}
        }
    }
}
