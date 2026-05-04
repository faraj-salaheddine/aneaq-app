<?php

namespace App\Http\Controllers\DEE;

use App\Http\Controllers\Controller;
use App\Models\CampagneEvaluation;
use App\Models\Dossier;
use App\Models\Etablissement;
use App\Models\Expert;
use Inertia\Inertia;

class AdminDashboardController extends Controller
{
    public function index()
    {
        if (!auth()->check()) {
            return redirect()->route('login');
        }

        if (auth()->user()->role !== 'admin_dee') {
            abort(403, 'Accès refusé. Cette page est réservée à l’administrateur DEE.');
        }

        return Inertia::render('DEE/AdminDashboard', [
            'stats' => [
                'etablissements' => Etablissement::count(),
                'experts' => Expert::count(),
                'vagues' => CampagneEvaluation::count(),
                'dossiers' => Dossier::count(),
                'visites' => Dossier::whereNotNull('date_visite')->count(),
            ],
        ]);
    }
}