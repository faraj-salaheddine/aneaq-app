<?php
namespace App\Http\Controllers\SI;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Expert;
use App\Models\Etablissement;
use App\Models\Universite;
use App\Models\University;
use Inertia\Inertia;

class SIDashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('SI/VueEnsemble', [
            'stats' => [
                'dee'            => User::where('role', 'si')->count(),
                'experts'        => Expert::count(),
                'etablissements' => Etablissement::count(),
                'universites'    => University::count(),
            ],
        ]);
    }
}