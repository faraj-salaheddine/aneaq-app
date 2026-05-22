<?php

namespace App\Http\Controllers\Etablissement;

use App\Http\Controllers\Controller;
use App\Models\Etablissement;
use App\Models\Dossier;
use App\Models\EtablissementOnboarding;
use App\Models\NotificationAneaq;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class EtablissementDashboardController extends Controller
{
    public function index(): Response
    {
        $etablissement = Etablissement::where('user_id', Auth::id())->firstOrFail();

        $dossier = Dossier::where('etablissement_id', $etablissement->id)->latest()->first();

        $onboarding = EtablissementOnboarding::where('etablissement_id', $etablissement->id)->first();

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
            $hasRapport = DB::table('dossier_documents')
                ->where('dossier_id', $dossier->id)
                ->whereIn('type_document', ['rapport_autoevaluation', ''])
                ->exists();

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

        $typesRequis = [
            'rapport_autoevaluation' => "Rapport d'autoévaluation",
        ];

        $deposes = DB::table('dossier_documents')
            ->where('dossier_id', $dossier->id)
            ->pluck('type_document')
            ->toArray();

        $hasAnyDoc = count($deposes) > 0;

        $manquants = [];
        foreach ($typesRequis as $type => $label) {
            // treat any uploaded document as satisfying rapport_autoevaluation
            if ($type === 'rapport_autoevaluation' && $hasAnyDoc) continue;
            if (!in_array($type, $deposes)) {
                $manquants[] = ['type' => $type, 'label' => $label];
            }
        }

        return $manquants;
    }

    private function buildTimeline(?Dossier $dossier): array
    {
        if (!$dossier) return [];

        $etapes = [
            ['statut' => 'en_attente_formulaire', 'label' => 'Sélectionné'],
            ['statut' => 'formulaire_complete',   'label' => 'Profil complété'],
            ['statut' => 'rapport_depose',        'label' => 'Rapport déposé'],
            ['statut' => 'visite_planifiee',      'label' => 'Visite planifiée'],
            ['statut' => 'valide',                'label' => 'Validé'],
        ];

        $mapping = [
            'date de visite planifiée' => 'visite_planifiee',
            'visite planifiée'         => 'visite_planifiee',
            'rapport déposé'           => 'rapport_depose',
            'profil complété'          => 'formulaire_complete',
            'validé'                   => 'valide',
            'rejeté'                   => 'valide',
            'rapport_en_attente'       => 'visite_planifiee',
            'date_visite_planifiee'    => 'visite_planifiee',
            'visite_planifiee'         => 'visite_planifiee',
            'valide'                   => 'valide',
            'valide_definitif'         => 'valide',
            'cloture'                  => 'valide',
        ];

        // Try statut first, fall back to status (English column name)
        $raw        = $dossier->statut ?? $dossier->status ?? '';
        $statutBrut = mb_strtolower(trim($raw));
        $statut     = $mapping[$statutBrut] ?? $raw;

        $ordre = array_column($etapes, 'statut');
        $idx   = array_search($statut, $ordre);

        // Data-driven overrides: trust actual DB fields over status strings
        if (!empty($dossier->date_visite)) {
            $visitIdx = array_search('visite_planifiee', $ordre);
            if ($idx === false || $idx < $visitIdx) {
                $idx = $visitIdx;
            }
        }

        $hasRapportExpert = DB::table('rapports_experts')
            ->where('dossier_id', $dossier->id)
            ->exists();

        if ($hasRapportExpert) {
            $visitIdx = array_search('visite_planifiee', $ordre);
            if ($idx === false || $idx < $visitIdx) {
                $idx = $visitIdx;
            }
        }

        return array_map(function ($etape, $i) use ($idx) {
            return array_merge($etape, [
                'done'    => $idx !== false && $i <= $idx,
                'current' => $idx !== false && $i === $idx,
            ]);
        }, $etapes, array_keys($etapes));
    }
}
