<?php

namespace App\Http\Controllers\Etablissement;

use App\Http\Controllers\Controller;
use App\Models\Dossier;
use App\Models\Etablissement;
use App\Models\EtablissementOnboarding;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class EtablissementProfilController extends Controller
{
    public function show(): Response
    {
        $etablissement = Etablissement::where('user_id', Auth::id())->firstOrFail();
        $onboarding    = EtablissementOnboarding::where('etablissement_id', $etablissement->id)->first();

        return Inertia::render('Etablissement/Profil/Show', [
            'etablissement' => $etablissement,
            'onboarding'    => $onboarding,
        ]);
    }

    public function edit(): Response
    {
        $etablissement = Etablissement::where('user_id', Auth::id())->firstOrFail();
        $onboarding    = EtablissementOnboarding::where('etablissement_id', $etablissement->id)->first();

        return Inertia::render('Etablissement/Profil/Edit', [
            'etablissement' => $etablissement,
            'onboarding'    => $onboarding,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $etablissement = Etablissement::where('user_id', Auth::id())->firstOrFail();

        $request->validate([
            'adresse'                => 'nullable|string|max:500',
            'site_web'               => 'nullable|url|max:255',
            'telephone'              => 'nullable|string|max:30',
            'responsable_nom'        => 'nullable|string|max:255',
            'responsable_fonction'   => 'nullable|string|max:255',
            'responsable_email'      => 'nullable|email|max:255',
            'responsable_telephone'  => 'nullable|string|max:30',
        ]);

        $dossier = Dossier::where('etablissement_id', $etablissement->id)->latest()->first();

        EtablissementOnboarding::updateOrCreate(
            ['etablissement_id' => $etablissement->id],
            [
                'dossier_id'             => $dossier?->id,
                'adresse'                => $request->adresse,
                'site_web'               => $request->site_web,
                'telephone'              => $request->telephone,
                'responsable_nom'        => $request->responsable_nom,
                'responsable_fonction'   => $request->responsable_fonction,
                'responsable_email'      => $request->responsable_email,
                'responsable_telephone'  => $request->responsable_telephone,
                'statut'                 => 'complete',
                'completed_at'           => now(),
            ]
        );

        if ($dossier && $dossier->statut === 'en_attente_formulaire') {
            $dossier->update(['statut' => 'formulaire_complete']);
        }

        return redirect()->route('etablissement.profil.show')
            ->with('success', 'Profil mis à jour avec succès.');
    }
}
