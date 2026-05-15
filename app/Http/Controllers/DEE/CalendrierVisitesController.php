<?php

namespace App\Http\Controllers\DEE;

use App\Http\Controllers\Controller;
use App\Models\Dossier;
use Inertia\Inertia;

class CalendrierVisitesController extends Controller
{
    public function index()
    {
        $visites = Dossier::whereNotNull('date_visite')
            ->with('etablissement:id,etablissement,etablissement_2,acronyme,ville')
            ->select('id', 'reference', 'etablissement_id', 'date_visite', 'statut')
            ->orderBy('date_visite')
            ->get()
            ->map(fn ($d) => [
                'id'            => $d->id,
                'reference'     => $d->reference,
                'etablissement' => $d->etablissement?->etablissement_2
                    ?? $d->etablissement?->etablissement
                    ?? $d->etablissement?->acronyme
                    ?? $d->reference,
                'ville'         => $d->etablissement?->ville ?? '',
                'date_visite'   => $d->date_visite?->format('Y-m-d'),
                'statut'        => $d->statut,
            ]);

        return Inertia::render('DEE/CalendrierVisites', [
            'visites' => $visites,
        ]);
    }
}
