<?php

namespace App\Http\Controllers\Expert;

use App\Http\Controllers\Controller;
use App\Models\DossierExpert;
use App\Models\Expert;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class ExpertCalendrierController extends Controller
{
    public function index()
    {
        $expert = Expert::where('user_id', Auth::id())->first();

        if (!$expert) {
            return Inertia::render('Expert/Calendrier', ['visites' => []]);
        }

        $visites = DossierExpert::where('expert_id', $expert->id)
            ->whereHas('dossier', fn ($q) => $q->whereNotNull('date_visite'))
            ->with(['dossier' => fn ($q) => $q->with('etablissement:id,etablissement,etablissement_2,acronyme,ville')->select('id', 'reference', 'etablissement_id', 'date_visite', 'statut')])
            ->get()
            ->filter(fn ($de) => $de->dossier !== null)
            ->map(fn ($de) => [
                'id'            => $de->dossier->id,
                'reference'     => $de->dossier->reference,
                'etablissement' => $de->dossier->etablissement?->etablissement_2
                    ?? $de->dossier->etablissement?->etablissement
                    ?? $de->dossier->etablissement?->acronyme
                    ?? $de->dossier->reference,
                'ville'         => $de->dossier->etablissement?->ville ?? '',
                'date_visite'   => $de->dossier->date_visite?->format('Y-m-d'),
                'statut'        => $de->dossier->statut,
                'role_expert'   => $de->role_expert,
            ])
            ->values();

        return Inertia::render('Expert/Calendrier', [
            'visites' => $visites,
        ]);
    }
}
