<?php
namespace App\Http\Controllers\SI;

use App\Http\Controllers\Controller;
use App\Models\Etablissement;
use Inertia\Inertia;

class EtablissementController extends Controller
{
    public function index()
    {
        return Inertia::render('SI/Etablissements', [
            'etablissements' => Etablissement::all(),
        ]);
    }
}
