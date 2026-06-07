<?php

namespace App\Http\Controllers\Etablissement;

use App\Http\Controllers\Controller;
use App\Models\Etablissement;
use App\Models\Dossier;
use App\Models\EtablissementOnboarding;
use App\Models\NotificationAneaq;
use App\Services\DossierDocumentService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
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
        $timeline = $this->buildTimeline($dossier);
        $documentsManquants = $this->buildDocumentsManquants($dossier);
        $dossierId = $dossier?->id;

        return Inertia::render('Etablissement/Dashboard', [
            'etablissement'        => $etablissement,
            'dossier'              => $dossier ? array_merge($dossier->toArray(), [
                'date_visite' => $dossier->date_visite?->format('d/m/Y'),
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

    private function buildTimeline(?Dossier $dossier): array
    {
        if (!$dossier) return [];

        $etapes = [
            ['statut' => 'en_attente_formulaire', 'label' => 'Sélectionné'],
            ['statut' => 'formulaire_complete',   'label' => 'Profil complété'],
            ['statut' => 'annexes_remplies',      'label' => 'Remplir les annexes'],
            ['statut' => 'visite_planifiee',      'label' => 'Visite planifiée'],
            ['statut' => 'valide',                'label' => 'Validé'],
        ];

        $mapping = [
            'établissement sélectionné'  => 'en_attente_formulaire',
            'sélectionné'                => 'en_attente_formulaire',
            'en attente formulaire'      => 'en_attente_formulaire',
            'acces_envoye'               => 'en_attente_formulaire',
            'accès envoyé'               => 'en_attente_formulaire',
            'profil complété'            => 'formulaire_complete',
            'formulaire complété'        => 'formulaire_complete',
            'rapport déposé'             => 'annexes_remplies',
            'rapport_en_attente'         => 'annexes_remplies',
            'rapport_depose'             => 'annexes_remplies',
            'en cours evaluation'        => 'annexes_remplies',
            'date de visite planifiée'   => 'visite_planifiee',
            'visite planifiée'           => 'visite_planifiee',
            'date_visite_planifiee'      => 'visite_planifiee',
            'visite_planifiee'           => 'visite_planifiee',
            'validé'                     => 'valide',
            'rejeté'                     => 'valide',
            'valide'                     => 'valide',
            'valide_definitif'           => 'valide',
            'cloture'                    => 'valide',
        ];

        $statutBrut = strtolower(trim($dossier->statut ?? ''));
        $statut     = $mapping[$statutBrut] ?? $dossier->statut;

        $ordre = array_column($etapes, 'statut');
        $idx   = array_search($statut, $ordre);

        // Default to first step if statut is unrecognized
        if ($idx === false) {
            $idx = 0;
        }

        return array_map(function ($etape, $i) use ($idx) {
            return array_merge($etape, [
                'done'    => $i <= $idx,
                'current' => $i === $idx,
            ]);
        }, $etapes, array_keys($etapes));
    }
}
