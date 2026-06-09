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
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SuiviRecommandationController extends Controller
{
    private const STATUTS_MISE_EN_OEUVRE = [
        'sans_echeance',
        'non_demarree',
        'en_cours',
        'realisee',
        'en_attente',
    ];

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
        abort_unless($r->statut === 'soumise_dee', 422, 'Seule une recommandation soumise peut être validée.');

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

    public function validerEtEnvoyer(Request $request, Dossier $dossier, int $recommandation)
    {
        $r = $this->findOrFail($recommandation, $dossier->id);
        abort_unless($r->statut === 'soumise_dee', 422, 'Seule une recommandation soumise peut être validée et envoyée.');

        $request->validate(['commentaire_dee' => 'nullable|string|max:2000']);

        DB::table('recommandations_domaines')->where('id', $r->id)->update([
            'statut'                   => 'envoyee_etablissement',
            'commentaire_dee'          => $request->commentaire_dee,
            'date_validation_dee'      => now(),
            'statut_mise_en_oeuvre'    => 'non_demarree',
            'date_envoi_etablissement' => now(),
            'updated_at'               => now(),
        ]);

        $this->log($r->id, 'validation_et_envoi', 'dee', Auth::id(), $request->commentaire_dee);
        ActivityLogger::log('recommandation_validee_envoyee', "Recommandation validée et envoyée à l'établissement — {$dossier->reference}", $dossier);

        $etab = $this->getEtablissement($dossier);
        if ($etab) {
            try {
                if (!empty($etab['email'])) {
                    Mail::to($etab['email'])->send(new RecommandationEnvoyeeEtablissementMail(
                        etablissementNom:      $etab['nom'],
                        dossierReference:      $dossier->reference,
                        nombreRecommandations: 1,
                        platformUrl:           config('app.url') . '/etablissement/recommandations/' . $dossier->id,
                    ));
                }
            } catch (\Throwable) {}

            if ($etab['user_id']) {
                NotificationAneaq::envoyer($etab['user_id'], 'general',
                    "Nouvelle recommandation — {$dossier->reference}",
                    "Une recommandation de la DEE est disponible. Consultez et indiquez votre délai de mise en œuvre.",
                    'Dossier', $dossier->id);
            }
        }

        return back()->with('success', 'Recommandation validée et envoyée à l\'établissement.');
    }

    public function renvoyerExpert(Request $request, Dossier $dossier, int $recommandation)
    {
        $r = $this->findOrFail($recommandation, $dossier->id);
        abort_unless($r->statut === 'soumise_dee', 422, 'Seule une recommandation soumise peut être renvoyée à l’expert.');

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
            ->update([
                'statut'                   => 'envoyee_etablissement',
                'statut_mise_en_oeuvre'    => 'non_demarree',
                'date_envoi_etablissement' => now(),
                'updated_at'               => now(),
            ]);

        foreach ($validated as $r) {
            $this->log($r->id, 'envoi_etablissement', 'dee', Auth::id(), null);
        }

        ActivityLogger::log('recommandations_envoyees', count($validated) . " recommandation(s) envoyée(s) à l'établissement", $dossier);

        $etab = $this->getEtablissement($dossier);
        if ($etab) {
            if (!empty($etab['email'])) {
                try {
                    Mail::to($etab['email'])->send(new RecommandationEnvoyeeEtablissementMail(
                        etablissementNom:      $etab['nom'],
                        dossierReference:      $dossier->reference,
                        nombreRecommandations: $validated->count(),
                        platformUrl:           config('app.url') . '/etablissement/recommandations/' . $dossier->id,
                    ));
                } catch (\Throwable $e) {
                    Log::error('Mail recommandation établissement : ' . $e->getMessage());
                }
            }

            $notifUserId = $etab['user_id']
                ?? DB::table('users')->where('email', $etab['email'] ?? '')->value('id');
            if ($notifUserId) {
                NotificationAneaq::envoyer($notifUserId, 'general',
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

    public function envoyerEtablissementOne(Dossier $dossier, int $recommandation)
    {
        $r = $this->findOrFail($recommandation, $dossier->id);
        abort_unless($r->statut === 'validee_dee', 422, 'Seule une recommandation validée peut être envoyée à l\'établissement.');

        DB::table('recommandations_domaines')->where('id', $r->id)->update([
            'statut'                   => 'envoyee_etablissement',
            'statut_mise_en_oeuvre'    => 'non_demarree',
            'date_envoi_etablissement' => now(),
            'updated_at'               => now(),
        ]);

        $this->log($r->id, 'envoi_etablissement', 'dee', Auth::id(), null);
        ActivityLogger::log('recommandation_envoyee', "Recommandation #{$r->id} envoyée à l'établissement", $dossier);

        $etab = $this->getEtablissement($dossier);
        if ($etab) {
            if (!empty($etab['email'])) {
                try {
                    Mail::to($etab['email'])->send(new RecommandationEnvoyeeEtablissementMail(
                        etablissementNom:      $etab['nom'],
                        dossierReference:      $dossier->reference,
                        nombreRecommandations: 1,
                        platformUrl:           config('app.url') . '/etablissement/recommandations/' . $dossier->id,
                    ));
                } catch (\Throwable $e) {
                    Log::error('Mail recommandation établissement : ' . $e->getMessage());
                }
            }

            $notifUserId = $etab['user_id']
                ?? DB::table('users')->where('email', $etab['email'] ?? '')->value('id');
            if ($notifUserId) {
                NotificationAneaq::envoyer($notifUserId, 'general',
                    "Nouvelle recommandation — {$dossier->reference}",
                    "Une recommandation de la DEE est disponible. Consultez et indiquez votre délai de mise en œuvre.",
                    'Dossier', $dossier->id);
            }
        }

        return back()->with('success', 'Recommandation envoyée à l\'établissement.');
    }

    public function mettreAJourStatutSuivi(Request $request, Dossier $dossier, int $recommandation)
    {
        $r = $this->findOrFail($recommandation, $dossier->id);
        abort_unless(
            in_array($r->statut, ['envoyee_etablissement', 'en_cours'], true),
            422,
            'Cette recommandation ne peut pas encore être suivie.'
        );

        $validated = $request->validate([
            'statut_mise_en_oeuvre' => 'required|in:' . implode(',', self::STATUTS_MISE_EN_OEUVRE),
        ]);

        DB::table('recommandations_domaines')
            ->where('id', $r->id)
            ->update([
                'statut_mise_en_oeuvre' => $validated['statut_mise_en_oeuvre'],
                'updated_at'            => now(),
            ]);

        $label = $this->statutMiseEnOeuvreLabel($validated['statut_mise_en_oeuvre']);

        $this->log($r->id, 'statut_mise_en_oeuvre', 'dee', Auth::id(), "Statut : {$label}");
        ActivityLogger::log('recommandation_statut_suivi', "Statut de mise en œuvre mis à jour : {$label}", $dossier);

        $etab = $this->getEtablissement($dossier);
        if ($etab && $etab['user_id']) {
            NotificationAneaq::envoyer(
                $etab['user_id'],
                'general',
                "Suivi de recommandation — {$dossier->reference}",
                "La DEE a mis à jour le statut d'une recommandation : {$label}.",
                'Dossier',
                $dossier->id
            );
        }

        return back()->with('success', "Statut de mise en œuvre mis à jour : {$label}.");
    }

    public function telechargerPreuve(Dossier $dossier, int $preuve)
    {
        abort_unless(
            Schema::hasTable('recommandations_domaines') && Schema::hasTable('recommandation_preuves'),
            503,
            'Le module de suivi des recommandations doit être initialisé par les migrations.'
        );

        $fichier = DB::table('recommandation_preuves')
            ->join(
                'recommandations_domaines',
                'recommandations_domaines.id',
                '=',
                'recommandation_preuves.recommandation_id'
            )
            ->where('recommandation_preuves.id', $preuve)
            ->where('recommandations_domaines.dossier_id', $dossier->id)
            ->select('recommandation_preuves.*')
            ->first();

        abort_if(!$fichier, 404);
        abort_unless(Storage::disk('public')->exists($fichier->fichier_path), 404);

        return Storage::disk('public')->download($fichier->fichier_path, $fichier->fichier_nom);
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
        abort_unless(
            in_array($r->statut, ['envoyee_etablissement', 'en_cours'], true),
            422,
            'Seule une recommandation transmise à l’établissement peut être clôturée.'
        );

        DB::table('recommandations_domaines')->where('id', $r->id)->update([
            'statut'                => 'cloturee',
            'statut_mise_en_oeuvre' => 'realisee',
            'date_cloture'          => now(),
            'cloture_par_id'        => Auth::id(),
            'updated_at'            => now(),
        ]);

        $this->log($r->id, 'cloture', 'dee', Auth::id(), null);
        ActivityLogger::log('recommandation_cloturee', "Recommandation #{$r->id} clôturée", $dossier);
        $this->alerterSiToutesCloturees($dossier);

        return back()->with('success', 'Recommandation clôturée.');
    }

    public function validerEtEnvoyerTous(Dossier $dossier)
    {
        $soumises = DB::table('recommandations_domaines')
            ->where('dossier_id', $dossier->id)
            ->where('statut', 'soumise_dee')
            ->get();

        if ($soumises->isEmpty()) {
            return back()->withErrors(['global' => 'Aucune recommandation soumise à accepter.']);
        }

        DB::table('recommandations_domaines')
            ->where('dossier_id', $dossier->id)
            ->where('statut', 'soumise_dee')
            ->update([
                'statut'                   => 'envoyee_etablissement',
                'date_validation_dee'      => now(),
                'statut_mise_en_oeuvre'    => 'non_demarree',
                'date_envoi_etablissement' => now(),
                'updated_at'               => now(),
            ]);

        foreach ($soumises as $r) {
            $this->log($r->id, 'validation_et_envoi', 'dee', Auth::id(), 'Acceptation groupée');
        }

        ActivityLogger::log('recommandations_acceptees_envoyees', "{$soumises->count()} recommandation(s) acceptées et envoyées à l'établissement — {$dossier->reference}", $dossier);

        $etab = $this->getEtablissement($dossier);
        $mailSent = false;
        if ($etab) {
            if (!empty($etab['email'])) {
                try {
                    Mail::to($etab['email'])->send(new RecommandationEnvoyeeEtablissementMail(
                        etablissementNom:      $etab['nom'],
                        dossierReference:      $dossier->reference,
                        nombreRecommandations: $soumises->count(),
                        platformUrl:           config('app.url') . '/etablissement/recommandations/' . $dossier->id,
                    ));
                    $mailSent = true;
                } catch (\Throwable $e) {
                    Log::error('Mail recommandation établissement : ' . $e->getMessage());
                }
            }

            $notifUserId = $etab['user_id']
                ?? DB::table('users')->where('email', $etab['email'] ?? '')->value('id');
            if ($notifUserId) {
                NotificationAneaq::envoyer($notifUserId, 'general',
                    "Recommandations reçues — {$dossier->reference}",
                    "{$soumises->count()} recommandation(s) de la DEE sont disponibles. Consultez-les sur la plateforme.",
                    'Dossier', $dossier->id);
            }
        }

        $msg = "{$soumises->count()} recommandation(s) acceptées et envoyées à l'établissement.";
        if ($mailSent) $msg .= " Un email a été envoyé à {$etab['email']}.";
        return back()->with('success', $msg);
    }

    // ─── Helpers ───────────────────────────────────────────────────────────

    private function getRecommandations(int $dossierId): array
    {
        if (!Schema::hasTable('recommandations_domaines')) return [];

        $items = DB::table('recommandations_domaines')
            ->where('dossier_id', $dossierId)
            ->orderBy('domaine_code')
            ->orderByDesc('created_at')
            ->get();

        $experts = Schema::hasTable('experts')
            ? DB::table('experts')
                ->whereIn('id', $items->pluck('expert_id')->filter()->unique())
                ->get()
                ->keyBy('id')
            : collect();

        $preuves = Schema::hasTable('recommandation_preuves')
            ? DB::table('recommandation_preuves')
                ->whereIn('recommandation_id', $items->pluck('id'))
                ->orderByDesc('created_at')
                ->get()
                ->groupBy('recommandation_id')
            : collect();

        /* Build domain code → label map from criteres */
        $domaineCodes = $items->pluck('domaine_code')->filter()->unique()->values();
        $domaineLabels = Schema::hasTable('criteres') && $domaineCodes->isNotEmpty()
            ? DB::table('criteres')
                ->whereIn('domaine', $domaineCodes)
                ->select('domaine', 'domaine_label')
                ->distinct()
                ->get()
                ->pluck('domaine_label', 'domaine')
            : collect();

        return $items->map(function ($item) use ($experts, $preuves, $domaineLabels) {
            $expert = $experts->get($item->expert_id);
            $item->expert_nom = $expert
                ? trim(($expert->prenom ?? '') . ' ' . ($expert->nom ?? $expert->name ?? '')) ?: 'Expert'
                : 'Expert';
            $item->domaine_label = $domaineLabels->get($item->domaine_code, $item->domaine_code);
            $item->preuves = $preuves
                ->get($item->id, collect())
                ->map(fn ($preuve) => [
                    'id'          => $preuve->id,
                    'fichier_nom' => $preuve->fichier_nom,
                    'description' => $preuve->description,
                    'url'         => route('dee.recommandations-suivi.preuves.telecharger', [
                        'dossier' => $item->dossier_id,
                        'preuve'  => $preuve->id,
                    ]),
                ])
                ->values()
                ->toArray();
            $item->preuves_count = count($item->preuves);

            return (array) $item;
        })->toArray();
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
            'sans_echeance'      => $col->where('statut_mise_en_oeuvre', 'sans_echeance')->count(),
            'non_demarrees'      => $col->where('statut_mise_en_oeuvre', 'non_demarree')->count(),
            'en_cours_suivi'     => $col->where('statut_mise_en_oeuvre', 'en_cours')->count(),
            'realisees'          => $col->where('statut_mise_en_oeuvre', 'realisee')->count(),
            'en_attente_suivi'   => $col->where('statut_mise_en_oeuvre', 'en_attente')->count(),
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

    private function statutMiseEnOeuvreLabel(string $statut): string
    {
        return match ($statut) {
            'sans_echeance' => 'Sans échéance',
            'non_demarree'  => 'Non démarrée',
            'en_cours'      => 'En cours',
            'realisee'      => 'Réalisée',
            'en_attente'    => 'En attente',
            default         => $statut,
        };
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
