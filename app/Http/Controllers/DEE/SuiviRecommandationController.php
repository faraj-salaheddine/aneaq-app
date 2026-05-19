<?php

namespace App\Http\Controllers\DEE;

use App\Http\Controllers\Controller;
use App\Mail\RecommandationEnvoyeeEtablissementMail;
use App\Mail\RecommandationRappelMail;
use App\Mail\RecommandationRenvoyeeExpertMail;
use App\Models\Dossier;
use App\Models\NotificationAneaq;
use App\Services\ActivityLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class SuiviRecommandationController extends Controller
{
    public function index(Dossier $dossier)
    {
        $recommandations = $this->getRecommandations($dossier->id);
        $stats           = $this->computeStats($recommandations);
        $rappels         = DB::table('recommandation_rappels')
            ->where('dossier_id', $dossier->id)
            ->orderByDesc('envoye_le')
            ->get()
            ->map(fn($r) => (array) $r)
            ->toArray();

        $dernierRappel  = $rappels[0] ?? null;
        $prochainRappel = null;
        if ($dernierRappel) {
            $prochainRappel = \Carbon\Carbon::parse($dernierRappel['envoye_le'])->addMonths(6)->format('Y-m-d');
        } elseif ($stats['premiere_date_envoi']) {
            $prochainRappel = \Carbon\Carbon::parse($stats['premiere_date_envoi'])->addMonths(6)->format('Y-m-d');
        }

        return Inertia::render('DEE/Recommandations/Suivi', [
            'dossier'         => $dossier->only('id', 'reference', 'etablissement_id'),
            'recommandations' => $recommandations,
            'stats'           => $stats,
            'rappels'         => $rappels,
            'dernierRappel'   => $dernierRappel,
            'prochainRappel'  => $prochainRappel,
            'etablissement'   => $this->getEtablissement($dossier),
        ]);
    }

    public function valider(Request $request, Dossier $dossier, int $recommandation)
    {
        $r = $this->findOrFail($recommandation, $dossier->id);
        $request->validate(['commentaire_dee' => 'nullable|string|max:2000']);

        DB::table('recommandations_domaines')->where('id', $r->id)->update([
            'statut'              => 'validee_dee',
            'commentaire_dee'     => $request->commentaire_dee,
            'date_validation_dee' => now(),
            'updated_at'          => now(),
        ]);

        $this->log($r->id, 'validation_dee', 'dee', Auth::id(), $request->commentaire_dee);
        ActivityLogger::log('recommandation_validee', "Recommandation validée pour le dossier {$dossier->reference}", $dossier);

        return back()->with('success', 'Recommandation validée.');
    }

    public function renvoyerExpert(Request $request, Dossier $dossier, int $recommandation)
    {
        $r = $this->findOrFail($recommandation, $dossier->id);
        $request->validate(['commentaire_dee' => 'required|string|max:2000']);

        DB::table('recommandations_domaines')->where('id', $r->id)->update([
            'statut'          => 'renvoyee_expert',
            'commentaire_dee' => $request->commentaire_dee,
            'updated_at'      => now(),
        ]);

        $this->log($r->id, 'renvoi_expert', 'dee', Auth::id(), $request->commentaire_dee);

        $expert = DB::table('experts')->where('id', $r->expert_id)->first();
        if ($expert) {
            $expertUserId = $expert->user_id ?? DB::table('users')->where('email', $expert->email ?? '')->value('id');
            if ($expertUserId) {
                NotificationAneaq::envoyer($expertUserId, 'general',
                    "Recommandation à réviser — {$dossier->reference}",
                    "La DEE vous demande de réviser une recommandation. Commentaire : {$request->commentaire_dee}",
                    'Dossier', $dossier->id);
                try {
                    if (!empty($expert->email)) {
                        Mail::to($expert->email)->send(new RecommandationRenvoyeeExpertMail(
                            expertName:       trim(($expert->prenom ?? '') . ' ' . ($expert->nom ?? '')) ?: 'Expert',
                            dossierReference: $dossier->reference,
                            recommandation:   $r->recommandation,
                            commentaireDee:   $request->commentaire_dee,
                            platformUrl:      config('app.url') . '/expert/recommandations-domaine/' . $dossier->id,
                        ));
                    }
                } catch (\Throwable) {}
            }
        }

        return back()->with('success', 'Recommandation renvoyée à l\'expert pour révision.');
    }

    public function envoyerEtablissement(Request $request, Dossier $dossier)
    {
        $validated = DB::table('recommandations_domaines')
            ->where('dossier_id', $dossier->id)
            ->where('statut', 'validee_dee')
            ->get();

        if ($validated->isEmpty()) {
            return back()->withErrors(['global' => 'Aucune recommandation validée à envoyer.']);
        }

        DB::table('recommandations_domaines')
            ->where('dossier_id', $dossier->id)
            ->where('statut', 'validee_dee')
            ->update(['statut' => 'envoyee_etablissement', 'date_envoi_etablissement' => now(), 'updated_at' => now()]);

        foreach ($validated as $r) {
            $this->log($r->id, 'envoi_etablissement', 'dee', Auth::id(), null);
        }

        ActivityLogger::log('recommandations_envoyees', count($validated) . " recommandation(s) envoyée(s) à l'établissement", $dossier);

        $etab = $this->getEtablissement($dossier);
        if ($etab) {
            try {
                if (!empty($etab['email'])) {
                    Mail::to($etab['email'])->send(new RecommandationEnvoyeeEtablissementMail(
                        etablissementNom:      $etab['nom'],
                        dossierReference:      $dossier->reference,
                        nombreRecommandations: $validated->count(),
                        platformUrl:           config('app.url') . '/etablissement/recommandations/' . $dossier->id,
                    ));
                }
            } catch (\Throwable) {}

            if ($etab['user_id']) {
                NotificationAneaq::envoyer($etab['user_id'], 'general',
                    "Recommandations reçues — {$dossier->reference}",
                    $validated->count() . " recommandation(s) de la DEE sont disponibles. Consultez et indiquez vos délais de mise en œuvre.",
                    'Dossier', $dossier->id);
            }
        }

        // Enregistrer dans rappels (1er envoi = début du compteur 6 mois)
        $dejaEnregistre = DB::table('recommandation_rappels')->where('dossier_id', $dossier->id)->exists();
        if (!$dejaEnregistre) {
            DB::table('recommandation_rappels')->insert([
                'dossier_id'    => $dossier->id,
                'type'          => 'standard',
                'envoye_par_id' => Auth::id(),
                'envoye_le'     => now(),
                'created_at'    => now(),
                'updated_at'    => now(),
            ]);
        }

        return back()->with('success', $validated->count() . ' recommandation(s) envoyée(s) à l\'établissement.');
    }

    public function envoyerRappel(Request $request, Dossier $dossier)
    {
        $request->validate([
            'type'    => 'required|in:standard,personnalise',
            'message' => 'required_if:type,personnalise|nullable|string|max:3000',
        ]);

        $etab = $this->getEtablissement($dossier);
        if (!$etab || empty($etab['email'])) {
            return back()->withErrors(['global' => "L'établissement n'a pas d'email configuré."]);
        }

        $enCoursCount = DB::table('recommandations_domaines')
            ->where('dossier_id', $dossier->id)
            ->whereIn('statut', ['envoyee_etablissement', 'en_cours'])
            ->count();

        try {
            Mail::to($etab['email'])->send(new RecommandationRappelMail(
                etablissementNom:     $etab['nom'],
                dossierReference:     $dossier->reference,
                type:                 $request->type,
                messagePersonnalise:  $request->message,
                nombreEnCours:        $enCoursCount,
                platformUrl:          config('app.url') . '/etablissement/recommandations/' . $dossier->id,
            ));
        } catch (\Throwable $e) {
            return back()->with('error', 'Erreur lors de l\'envoi : ' . $e->getMessage());
        }

        DB::table('recommandation_rappels')->insert([
            'dossier_id'           => $dossier->id,
            'type'                 => $request->type,
            'message_personnalise' => $request->message,
            'envoye_par_id'        => Auth::id(),
            'envoye_le'            => now(),
            'created_at'           => now(),
            'updated_at'           => now(),
        ]);

        if ($etab['user_id']) {
            NotificationAneaq::envoyer($etab['user_id'], 'general',
                "Rappel recommandations — {$dossier->reference}",
                "La DEE vous rappelle que {$enCoursCount} recommandation(s) sont en attente pour le dossier {$dossier->reference}.",
                'Dossier', $dossier->id);
        }

        ActivityLogger::log('rappel_recommandations', "Rappel ({$request->type}) envoyé à l'établissement", $dossier);

        return back()->with('success', 'Rappel envoyé à l\'établissement.');
    }

    public function cloturer(Dossier $dossier, int $recommandation)
    {
        $r = $this->findOrFail($recommandation, $dossier->id);

        DB::table('recommandations_domaines')->where('id', $r->id)->update([
            'statut'         => 'cloturee',
            'date_cloture'   => now(),
            'cloture_par_id' => Auth::id(),
            'updated_at'     => now(),
        ]);

        $this->log($r->id, 'cloture', 'dee', Auth::id(), null);
        ActivityLogger::log('recommandation_cloturee', "Recommandation #{$r->id} clôturée", $dossier);
        $this->alerterSiToutesCloturees($dossier);

        return back()->with('success', 'Recommandation clôturée.');
    }

    // ─── Helpers ───────────────────────────────────────────────────────────

    private function getRecommandations(int $dossierId): array
    {
        if (!Schema::hasTable('recommandations_domaines')) return [];
        return DB::table('recommandations_domaines')
            ->where('dossier_id', $dossierId)
            ->orderBy('domaine_code')
            ->orderByDesc('created_at')
            ->get()->map(fn($r) => (array) $r)->toArray();
    }

    private function computeStats(array $items): array
    {
        $col  = collect($items);
        $total = count($items);
        return [
            'total'              => $total,
            'brouillon'          => $col->where('statut', 'brouillon')->count(),
            'soumises'           => $col->where('statut', 'soumise_dee')->count(),
            'renvoyees'          => $col->where('statut', 'renvoyee_expert')->count(),
            'validees'           => $col->where('statut', 'validee_dee')->count(),
            'envoyees'           => $col->whereIn('statut', ['envoyee_etablissement', 'en_cours'])->count(),
            'cloturees'          => $col->where('statut', 'cloturee')->count(),
            'premiere_date_envoi'=> $col->whereNotNull('date_envoi_etablissement')->min('date_envoi_etablissement'),
            'tout_cloture'       => $total > 0 && $total === $col->where('statut', 'cloturee')->count(),
        ];
    }

    private function getEtablissement(Dossier $dossier): ?array
    {
        if (!$dossier->etablissement_id) return null;
        $etab = DB::table('etablissements')->where('id', $dossier->etablissement_id)->first();
        if (!$etab) return null;
        $userId = $etab->user_id ?? DB::table('users')->where('email', $etab->email ?? '')->value('id');
        return [
            'id'      => $etab->id,
            'nom'     => $etab->etablissement_2 ?? $etab->etablissement ?? $etab->nom ?? '—',
            'email'   => $etab->email ?? $etab->mail ?? null,
            'user_id' => $userId,
        ];
    }

    private function findOrFail(int $id, int $dossierId): object
    {
        $r = DB::table('recommandations_domaines')->where('id', $id)->where('dossier_id', $dossierId)->first();
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

    private function alerterSiToutesCloturees(Dossier $dossier): void
    {
        $total     = DB::table('recommandations_domaines')->where('dossier_id', $dossier->id)->count();
        $cloturees = DB::table('recommandations_domaines')->where('dossier_id', $dossier->id)->where('statut', 'cloturee')->count();
        if ($total > 0 && $total === $cloturees) {
            $admins = DB::table('users')->where('role', 'admin_dee')->get();
            foreach ($admins as $admin) {
                try {
                    NotificationAneaq::envoyer($admin->id, 'general',
                        "Toutes recommandations clôturées — {$dossier->reference}",
                        "Toutes les recommandations du dossier {$dossier->reference} sont clôturées. Le dossier peut être clôturé.",
                        'Dossier', $dossier->id);
                } catch (\Throwable) {}
            }
        }
    }
}
