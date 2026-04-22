<?php
namespace App\Http\Controllers\SI;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Expert;
use App\Models\Etablissement;
use App\Models\Universite;
use App\Models\University;
use App\Models\UtilisateurDEE;
use Inertia\Inertia;

class SIDashboardController extends Controller
{
    public function index()
    {
        // Recent activity — last 10 changes across experts and DEE users
        $recentExperts = Expert::orderBy('updated_at', 'desc')
            ->take(5)
            ->get()
            ->map(fn($e) => [
                'type'       => 'expert',
                'action'     => $e->created_at->eq($e->updated_at) ? 'Compte créé' : 'Compte modifié',
                'name'       => $e->nom . ' ' . $e->prenom,
                'email'      => $e->email,
                'date'       => $e->updated_at,
                'date_human' => $e->updated_at->diffForHumans(),
            ]);

        $recentDEE = UtilisateurDEE::with('user')
            ->orderBy('updated_at', 'desc')
            ->take(5)
            ->get()
            ->map(fn($u) => [
                'type'       => 'dee',
                'action'     => $u->created_at->eq($u->updated_at) ? 'Compte créé' : 'Compte modifié',
                'name'       => $u->nom . ' ' . $u->prenom,
                'email'      => $u->user?->email,
                'role'       => $u->role,
                'date'       => $u->updated_at,
                'date_human' => $u->updated_at->diffForHumans(),
            ]);

        $recentActivity = $recentExperts->concat($recentDEE)
            ->sortByDesc('date')
            ->take(8)
            ->values();

        return Inertia::render('SI/VueEnsemble', [
            'stats' => [
                'dee'            => UtilisateurDEE::count(),
                'experts'        => Expert::count(),
                'etablissements' => Etablissement::count(),
                'universites'    => University::count(),
            ],
            'recentActivity' => $recentActivity,
        ]);
    }
}