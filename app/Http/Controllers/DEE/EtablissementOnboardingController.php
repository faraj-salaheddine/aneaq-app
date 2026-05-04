<?php

namespace App\Http\Controllers\DEE;

use App\Http\Controllers\Controller;

use App\Models\Dossier;
use App\Models\EtablissementOnboarding;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EtablissementOnboardingController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user();
        $etablissement = $user?->etablissement;

        abort_if(! $etablissement, 403, 'Aucun établissement associé à ce compte.');

        $onboarding = $etablissement->onboarding;
        $dossier = Dossier::where('etablissement_id', $etablissement->id)->latest()->first();

        return Inertia::render('Etablissement/FirstForm', [
            'etablissement' => [
                'id' => $etablissement->id,
                'nom' => $etablissement->etablissement_2 ?: $etablissement->etablissement,
                'email' => $etablissement->email,
                'ville' => $etablissement->ville,
                'universite' => $etablissement->universite,
            ],
            'dossier' => $dossier ? [
                'id' => $dossier->id,
                'reference' => $dossier->reference,
                'statut' => $dossier->statut,
            ] : null,
            'form' => $onboarding ? [
                'adresse' => $onboarding->adresse,
                'site_web' => $onboarding->site_web,
                'telephone' => $onboarding->telephone,
                'responsable_nom' => $onboarding->responsable_nom,
                'responsable_fonction' => $onboarding->responsable_fonction,
                'responsable_email' => $onboarding->responsable_email,
                'responsable_telephone' => $onboarding->responsable_telephone,
                'statut' => $onboarding->statut,
            ] : null,
        ]);
    }

    public function store(Request $request)
{
    $validated = $request->validate([
        'etablissement_id' => ['required', 'exists:etablissements,id'],
        'campagne_evaluation_id' => ['nullable', 'exists:campagne_evaluations,id'],
        'responsable_nom' => ['nullable', 'string', 'max:255'],
        'responsable_email' => ['nullable', 'email', 'max:255'],
        'responsable_telephone' => ['nullable', 'string', 'max:255'],
        'observation' => ['nullable', 'string'],
    ]);

    \App\Models\EtablissementOnboarding::create([
        'etablissement_id' => $validated['etablissement_id'],
        'campagne_evaluation_id' => $validated['campagne_evaluation_id'] ?? null,
        'responsable_nom' => $validated['responsable_nom'] ?? null,
        'responsable_email' => $validated['responsable_email'] ?? null,
        'responsable_telephone' => $validated['responsable_telephone'] ?? null,
        'observation' => $validated['observation'] ?? null,
    ]);

    return back()->with('success', 'Formulaire enregistré avec succès.');
}
}