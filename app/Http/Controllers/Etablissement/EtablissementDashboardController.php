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
            ->latest()->take(5)->get();

        $notificationsNonLues = NotificationAneaq::where('user_id', Auth::id())
            ->where('lu', false)->count();

        $taches  = $this->buildTaches($etablissement, $dossier, $onboarding);
        $timeline = $this->buildTimeline($dossier);

        return Inertia::render('Etablissement/Dashboard', [
            'etablissement'        => $etablissement,
            'dossier'              => $dossier,
            'onboarding'           => $onboarding,
            'notifications'        => $notifications,
            'notificationsNonLues' => $notificationsNonLues,
            'taches'               => $taches,
            'timeline'             => $timeline,
        ]);
    }

    private function buildTaches(Etablissement $etablissement, ?Dossier $dossier, ?EtablissementOnboarding $onboarding): array
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
                ->where('type_document', 'rapport_autoevaluation')
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

    private function buildTimeline(?Dossier $dossier): array
    {
        if (!$dossier) return [];

        $etapes = [
            ['statut' => 'en_attente_formulaire',  'label' => 'Sélectionné'],
            ['statut' => 'formulaire_complete',     'label' => 'Profil complété'],
            ['statut' => 'rapport_depose',          'label' => 'Rapport déposé'],
            ['statut' => 'visite_planifiee',        'label' => 'Visite planifiée'],
            ['statut' => 'rapport_en_attente',      'label' => 'Rapport expert'],
            ['statut' => 'valide',                  'label' => 'Validé'],
        ];

        $ordre = array_column($etapes, 'statut');
        $idx   = array_search($dossier->statut, $ordre);

        return array_map(function ($etape, $i) use ($idx) {
            return array_merge($etape, [
                'done'    => $idx !== false && $i <= $idx,
                'current' => $idx !== false && $i === $idx,
            ]);
        }, $etapes, array_keys($etapes));
    }
}
