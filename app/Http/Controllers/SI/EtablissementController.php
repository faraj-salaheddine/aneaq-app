<?php
namespace App\Http\Controllers\SI;

use App\Http\Controllers\Controller;
use App\Models\Etablissement;
use App\Models\Universite;
use App\Models\University;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EtablissementController extends Controller
{
    public function index()
    {
        return Inertia::render('SI/Etablissements/Index', [
            'etablissements' => Etablissement::all(),
        ]);
    }

    public function create()
    {
        return Inertia::render('SI/Etablissements/Create', [
            'universites' => University::orderBy('name')->get(['id', 'name']),
            'villes'      => Etablissement::distinct()->pluck('ville')->filter()->sort()->values(),
        ]);
    }

    public function edit(Etablissement $etablissement)
    {
        return Inertia::render('SI/Etablissements/Edit', [
            'etablissement' => $etablissement,
            'universites'   => University::orderBy('name')->get(['id', 'name']),
            'villes'        => Etablissement::distinct()->pluck('ville')->filter()->sort()->values(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'etablissement'         => 'required|string|max:255',
            'etablissement_2'       => 'nullable|string|max:255',
            'acronyme'              => 'nullable|string|max:50',
            'universite'            => 'required|string|max:255',
            'ville'                 => 'required|string|max:255',
            'email'                 => 'nullable|email|max:255',
            'domaine_connaissances' => 'nullable|string|max:255',
            'evaluation'            => 'nullable|string|max:255',
        ]);

        Etablissement::create($request->only([
            'etablissement',
            'etablissement_2',
            'acronyme',
            'universite',
            'ville',
            'email',
            'domaine_connaissances',
            'evaluation',
        ]));

        return redirect()->route('si.etablissements.index')
            ->with('success', 'Établissement ajouté avec succès.');
    }

    public function update(Request $request, Etablissement $etablissement)
    {
        $request->validate([
            'etablissement'         => 'required|string|max:255',
            'etablissement_2'       => 'nullable|string|max:255',
            'acronyme'              => 'nullable|string|max:50',
            'universite'            => 'required|string|max:255',
            'ville'                 => 'required|string|max:255',
            'email'                 => 'nullable|email|max:255',
            'domaine_connaissances' => 'nullable|string|max:255',
            'evaluation'            => 'nullable|string|max:255',
        ]);

        $etablissement->update($request->only([
            'etablissement',
            'etablissement_2',
            'acronyme',
            'universite',
            'ville',
            'email',
            'domaine_connaissances',
            'evaluation',
        ]));

        return redirect()->route('si.etablissements.index')
            ->with('success', 'Établissement modifié avec succès.');
    }
}