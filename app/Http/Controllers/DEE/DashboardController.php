<?php

namespace App\Http\Controllers\DEE;

use App\Http\Controllers\Controller;

use Inertia\Inertia;
use App\Models\Expert;
use App\Models\Dossier;
use App\Models\Etablissement;
use App\Models\CampagneEvaluation;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'etablissements' => Etablissement::count(),
            'experts'        => Expert::count(),
            'vagues'         => CampagneEvaluation::count(),
            'dossiers'       => Dossier::count(),

            // Visites = seulement les dossiers avec visite planifiée
            'visites'        => Dossier::where(function ($query) {
                $query->where('statut', 'Date de visite planifiée')
                      ->orWhere('statut', 'date de visite planifiée')
                      ->orWhereNotNull('date_visite');
            })->count(),
        ];

        return Inertia::render('Dashboard', [
            'stats' => $stats
        ]);
    }
}