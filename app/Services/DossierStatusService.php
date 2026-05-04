<?php

namespace App\Services;

use App\Models\Dossier;
use Illuminate\Support\Facades\Schema;

class DossierStatusService
{
    public static function refresh(Dossier $dossier): void
    {
        if (!Schema::hasColumn('dossiers', 'statut')) {
            return;
        }

        $documents = collect();

        if (method_exists($dossier, 'documents')) {
            $documents = $dossier->documents()->get();
        } elseif (class_exists(\App\Models\DossierDocument::class)) {
            $documents = \App\Models\DossierDocument::query()
                ->where('dossier_id', $dossier->id)
                ->get();
        }

        $types = $documents->map(function ($document) {
            return strtolower(
                $document->type
                ?? $document->document_type
                ?? $document->categorie
                ?? $document->nom
                ?? $document->name
                ?? ''
            );
        });

        $status = 'Établissement sélectionné';

        if ($types->contains(fn ($type) => str_contains($type, 'formulaire'))) {
            $status = 'Formulaire rempli';
        }

        if ($types->contains(fn ($type) => str_contains($type, 'auto') || str_contains($type, 'autoevaluation') || str_contains($type, 'autoévaluation'))) {
            $status = "Rapport d’autoévaluation ajouté";
        }

        if ($types->contains(fn ($type) => str_contains($type, 'annexe'))) {
            $status = 'Annexe ajoutée';
        }

        if ($types->contains(fn ($type) => str_contains($type, 'rapport expert'))) {
            $status = 'Rapport expert ajouté';
        }

        if (!empty($dossier->date_visite)) {
            $status = 'Date de visite planifiée';
        }

        $dossier->forceFill([
            'statut' => $status,
        ])->save();
    }
}