<?php

namespace App\Http\Controllers\Etablissement;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Etablissement;
use App\Models\Dossier;
use App\Models\EtablissementOnboarding;
use App\Models\NotificationAneaq;
use App\Services\DossierDocumentService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;

class EtablissementDashboardController extends Controller
{
    use ResolvesActiveEtablissement;

    public function index(): Response
    {
        $etablissement = $this->activeEtablissement();
        $dossier       = Dossier::where('etablissement_id', $etablissement->id)->latest()->first();
        $onboarding    = EtablissementOnboarding::where('etablissement_id', $etablissement->id)->first();

        $notifications = NotificationAneaq::where('user_id', Auth::id())
            ->latest()->take(5)->get()
            ->map(fn($n) => [
                'id'         => $n->id,
                'titre'      => $n->titre,
                'message'    => $n->message,
                'type'       => $n->type ?? 'info',
                'lu'         => $n->lu,
                'created_at' => $n->created_at->diffForHumans(),
            ]);

        $notificationsNonLues = NotificationAneaq::where('user_id', Auth::id())
            ->where('lu', false)->count();

        $derniereNotif = NotificationAneaq::where('user_id', Auth::id())
            ->where('lu', false)
            ->latest()
            ->first();

        $derniereNotif = $derniereNotif ? [
            'id'      => $derniereNotif->id,
            'titre'   => $derniereNotif->titre,
            'message' => $derniereNotif->message,
            'type'    => $derniereNotif->type ?? 'info',
        ] : null;

        $taches  = $this->buildTaches($dossier, $onboarding);
        $timeline = $this->buildTimeline($dossier, $etablissement->id);
        $documentsManquants = $this->buildDocumentsManquants($dossier);
        $dossierId = $dossier?->id;

        return Inertia::render('Etablissement/Dashboard', [
            'etablissement'        => $etablissement,
            'dossier'              => $dossier ? array_merge($dossier->toArray(), [
                'date_visite' => $dossier->date_visite?->format('d/m/Y'),
                'est_cloture' => !empty($dossier->cloture_at),
            ]) : null,
            'onboarding'           => $onboarding,
            'notifications'        => $notifications,
            'notificationsNonLues' => $notificationsNonLues,
            'derniereNotif'        => $derniereNotif,
            'taches'               => $taches,
            'timeline'             => $timeline,
            'documentsManquants'   => $documentsManquants,
            'dossierId'            => $dossierId,
        ]);
    }

    private function buildTaches(?Dossier $dossier, ?EtablissementOnboarding $onboarding): array
    {
        $taches = [];

        if (!$onboarding || $onboarding->statut !== 'complete') {
            $taches[] = [
                'id'    => 'profil',
                'label' => "Compléter le profil de l'établissement",
                'lien'  => route('etablissement.profil.edit'),
            ];
        }

        if ($dossier) {
            $hasRapport = DossierDocumentService::hasRapportAutoevaluation($dossier);

            if (!$hasRapport) {
                $taches[] = [
                    'id'    => 'rapport',
                    'label' => "Déposer le rapport d'autoévaluation",
                    'lien'  => route('etablissement.documents.index'),
                ];
            }
        }

        return $taches;
    }

    private function buildDocumentsManquants(?Dossier $dossier): array
    {
        if (!$dossier) return [];

        if (DossierDocumentService::hasRapportAutoevaluation($dossier)) {
            return [];
        }

        return [[
            'type'  => 'rapport_autoevaluation',
            'label' => "Rapport d'autoévaluation",
        ]];
    }

    private function buildTimeline(?Dossier $dossier, int $etablissementId = 0): array
    {
        if (!$dossier) return [];

        $etapes = [
            ['statut' => 'en_attente_formulaire', 'label' => 'Sélectionné'],
            ['statut' => 'formulaire_complete',   'label' => 'Profil complété'],
            ['statut' => 'rapport_depose',        'label' => "Rapport d'autoévaluation"],
            ['statut' => 'annexes_remplies',      'label' => 'Remplir les annexes'],
            ['statut' => 'visite_planifiee',      'label' => 'Visite planifiée'],
            ['statut' => 'valide',                'label' => 'Validé'],
        ];

        $rawStatus = strtolower(trim($dossier->statut ?? ''));

        $done0 = true;

        $profilStatuts = [
            'formulaire_complete', 'formulaire complet', 'formulaire soumis',
            'rapport_depose', 'rapport depose', 'rapport_en_attente', 'rapport en attente',
            'accepte_par_dee', 'confirme_par_dee',
            'en cours evaluation', 'visite_planifiee', 'visite planifiee',
            'visite_confirmee', 'valide', 'valide_definitif', 'cloture', 'rejete',
        ];
        $done1 = in_array($rawStatus, $profilStatuts);

        // Rapport d'autoévaluation déposé
        $done2 = $etablissementId > 0
            && Schema::hasTable('dossier_documents')
            && \App\Models\DossierDocument::where('dossier_id', $dossier->id)
                ->where('type_document', 'rapport_autoevaluation')
                ->exists();

        // Annexes done ONLY after user clicks Submit (annexes_publiees)
        $done3 = $etablissementId > 0
            && Schema::hasTable('activity_logs')
            && ActivityLog::where('action', 'annexes_publiees')
                ->where('model_type', Etablissement::class)
                ->where('model_id', $etablissementId)
                ->exists();

        $done4 = !empty($dossier->date_visite);

        $done5 = in_array($rawStatus, ['valide', 'valide_definitif', 'cloture'])
            || !empty($dossier->cloture_at);

        $doneFlags = [$done0, $done1, $done2, $done3, $done4, $done5];

        $currentIdx = count($etapes) - 1;
        foreach ($doneFlags as $i => $isDone) {
            if (!$isDone) { $currentIdx = $i; break; }
        }

        return array_map(function ($etape, $i) use ($doneFlags, $currentIdx) {
            return array_merge($etape, [
                'done'    => $doneFlags[$i],
                'current' => $i === $currentIdx,
            ]);
        }, $etapes, array_keys($etapes));
    }
}
