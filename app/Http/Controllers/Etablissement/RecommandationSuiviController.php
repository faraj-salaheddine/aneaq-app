<?php

namespace App\Http\Controllers\Etablissement;

use App\Http\Controllers\Controller;
use App\Models\Dossier;
use App\Services\ActivityLogger;
use App\Services\NotifierDee;
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

    public function uploaderPlusieursPreuves(Request $request, Dossier $dossier, int $recommandation)
    {
        $this->autoriser($dossier);
        $r = $this->findOrFail($recommandation, $dossier->id);

        $request->validate([
            'fichiers'   => 'required|array|min:1|max:10',
            'fichiers.*' => 'required|file|max:20480',
        ]);

        $noms = [];
        foreach ($request->file('fichiers') as $file) {
            $path = $file->store("preuves/recommandations/{$dossier->id}", 'public');
            DB::table('recommandation_preuves')->insert([
                'recommandation_id' => $r->id,
                'fichier_path'      => $path,
                'fichier_nom'       => $file->getClientOriginalName(),
                'fichier_type'      => $file->getClientOriginalExtension(),
                'fichier_taille'    => $file->getSize(),
                'description'       => null,
                'uploaded_by'       => Auth::id(),
                'created_at'        => now(),
                'updated_at'        => now(),
            ]);
            $noms[] = $file->getClientOriginalName();
        }

        $this->log($r->id, 'preuves_brouillon', 'etablissement', Auth::id(),
            count($noms) . ' fichier(s) enregistré(s) en brouillon : ' . implode(', ', $noms));

        ActivityLogger::log('preuves_brouillon', count($noms) . " preuve(s) enregistrées en brouillon pour {$dossier->reference}", $dossier);

        return back()->with('success', count($noms) . ' fichier(s) enregistré(s).');
    }

    public function envoyerAuDEE(Dossier $dossier, int $recommandation)
    {
        $this->autoriser($dossier);
        $r = $this->findOrFail($recommandation, $dossier->id);

        $preuveCount = DB::table('recommandation_preuves')
            ->where('recommandation_id', $r->id)
            ->count();

        if ($preuveCount === 0) {
            return back()->withErrors(['global' => 'Déposez au moins un fichier avant d\'envoyer à la DEE.']);
        }

        DB::table('recommandations_domaines')->where('id', $r->id)->update([
            'statut'                     => 'en_cours',
            'statut_mise_en_oeuvre'      => 'en_cours',
            'date_reponse_etablissement' => now(),
            'updated_at'                 => now(),
        ]);

        $this->log($r->id, 'envoi_dee', 'etablissement', Auth::id(),
            "{$preuveCount} preuve(s) soumise(s) à la DEE");

        ActivityLogger::log('recommandation_envoyee_dee',
            "Preuves envoyées à la DEE pour une recommandation du dossier {$dossier->reference}", $dossier);

        $this->notifierDee($dossier,
            "L'établissement a soumis {$preuveCount} preuve(s) pour une recommandation du dossier {$dossier->reference}.");

        return back()->with('success', 'Preuves envoyées à la DEE avec succès.');
    }

    public function supprimerPreuve(Dossier $dossier, int $preuve)
    {
        $this->autoriser($dossier);

        $p = DB::table('recommandation_preuves')
            ->join('recommandations_domaines', 'recommandation_preuves.recommandation_id', '=', 'recommandations_domaines.id')
            ->where('recommandation_preuves.id', $preuve)
            ->where('recommandations_domaines.dossier_id', $dossier->id)
            ->select('recommandation_preuves.*')
            ->first();

        abort_if(!$p, 404);

        Storage::disk('public')->delete($p->fichier_path);
        DB::table('recommandation_preuves')->where('id', $preuve)->delete();

        return back()->with('success', 'Fichier supprimé.');
    }

    // ─── Helpers ───────────────────────────────────────────────────────────

    private function autoriser(Dossier $dossier): void
    {
        $user = Auth::user();
        $etab = DB::table('etablissements')->where('id', $dossier->etablissement_id)->first();
        abort_unless($etab, 404);
        $isOwner = ((int) ($etab->user_id ?? 0) === (int) $user->id)
                || (!empty($etab->email) && $etab->email === $user->email);
        abort_unless($isOwner, 403);
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
        NotifierDee::pourDossier(
            $dossier,
            'general',
            "Suivi établissement — {$dossier->reference}",
            $message
        );
    }
}
