<?php

namespace App\Http\Controllers\DEE;

use App\Http\Controllers\Controller;

use App\Models\Dossier;
use App\Models\DossierExpert;
use App\Models\Etablissement;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class WorkflowController extends Controller
{
    public function visites()
    {
        $dossierTable = (new Dossier())->getTable();

        $dateColumns = [
            'date_visite',
            'date_de_visite',
            'visite_date',
            'datevisite',
        ];

        $statusColumns = [
            'statut',
            'status',
        ];

        $query = Dossier::query();

        $query->where(function ($q) use ($dossierTable, $dateColumns, $statusColumns) {
            foreach ($dateColumns as $dateColumn) {
                if (Schema::hasColumn($dossierTable, $dateColumn)) {
                    $q->orWhere(function ($subQuery) use ($dateColumn) {
                        $subQuery
                            ->whereNotNull($dateColumn)
                            ->where($dateColumn, '!=', '');
                    });
                }
            }

            foreach ($statusColumns as $statusColumn) {
                if (Schema::hasColumn($dossierTable, $statusColumn)) {
                    $q->orWhere($statusColumn, 'like', '%visite%')
                        ->orWhere($statusColumn, 'like', '%Visite%')
                        ->orWhere($statusColumn, 'Date de visite planifiée')
                        ->orWhere($statusColumn, 'Visite programmée')
                        ->orWhere($statusColumn, 'date_visite_planifiee')
                        ->orWhere($statusColumn, 'visite_programmee');
                }
            }
        });

        if (Schema::hasColumn($dossierTable, 'date_visite')) {
            $query->orderByRaw('date_visite IS NULL, date_visite ASC');
        } elseif (Schema::hasColumn($dossierTable, 'updated_at')) {
            $query->orderByDesc('updated_at');
        } else {
            $query->orderByDesc('id');
        }

        $dossiers = $query->get();

        $etablissementIds = $dossiers
            ->pluck('etablissement_id')
            ->filter()
            ->unique()
            ->values();

        $etablissements = collect();

        if (Schema::hasTable('etablissements') && $etablissementIds->isNotEmpty()) {
            $etablissements = Etablissement::query()
                ->whereIn('id', $etablissementIds)
                ->get()
                ->keyBy('id');
        }

        $visites = $dossiers
            ->map(function ($dossier) use ($etablissements) {
                $etablissementId = $this->read($dossier, ['etablissement_id']);
                $etablissement = $etablissements->get($etablissementId);

                $dateVisite = $this->read($dossier, [
                    'date_visite',
                    'date_de_visite',
                    'visite_date',
                    'datevisite',
                ]);

                return [
                    'id' => $dossier->id,
                    'reference' => $this->read($dossier, ['reference'], '—'),
                    'nom' => $this->read($dossier, ['nom', 'name', 'titre'], 'Dossier'),
                    'campagne' => $this->read($dossier, ['campagne', 'campagne_reference'], '—'),
                    'statut' => $this->read($dossier, ['statut', 'status'], 'Date de visite planifiée'),
                    'status' => $this->read($dossier, ['status', 'statut'], 'Date de visite planifiée'),
                    'date_visite' => $dateVisite,
                    'observation' => $this->read($dossier, ['observation', 'observations'], null),

                    'etablissement' => [
                        'id' => $etablissement?->id,
                        'nom' => $this->read($etablissement, [
                            'nom',
                            'etablissement_2',
                            'etablissement',
                            'name',
                            'intitule',
                        ], '—'),
                        'ville' => $this->read($etablissement, ['ville', 'city'], '—'),
                        'universite' => $this->read($etablissement, [
                            'universite',
                            'universite_nom',
                            'university',
                        ], '—'),
                        'email' => $this->read($etablissement, ['email', 'mail'], '—'),
                    ],

                    'url' => route('dee.dossiers.show', $dossier->id),
                ];
            })
            ->values();

        return Inertia::render('DEE/Workflow/Visites', [
            'visites' => $visites,
            'stats' => [
                'visites' => $visites->count(),
                'a_venir' => $visites->filter(function ($visite) {
                    if (empty($visite['date_visite'])) {
                        return false;
                    }

                    return strtotime($visite['date_visite']) >= strtotime(date('Y-m-d 00:00:00'));
                })->count(),
                'experts' => $this->countDossierExperts($dossiers),
                'documents' => $this->countDocuments($dossiers),
            ],
        ]);
    }

    private function read($model, array $columns, mixed $default = null): mixed
    {
        if (!$model) {
            return $default;
        }

        foreach ($columns as $column) {
            try {
                if (method_exists($model, 'getAttribute')) {
                    $value = $model->getAttribute($column);
                } else {
                    $value = $model->{$column} ?? null;
                }

                if ($value !== null && $value !== '') {
                    return $value;
                }
            } catch (\Throwable $e) {
                continue;
            }
        }

        return $default;
    }

    private function countDossierExperts($dossiers): int
    {
        if (!Schema::hasTable('dossier_experts')) {
            return 0;
        }

        $ids = $dossiers->pluck('id')->filter()->values();

        if ($ids->isEmpty()) {
            return 0;
        }

        return DossierExpert::query()
            ->whereIn('dossier_id', $ids)
            ->count();
    }

    private function countDocuments($dossiers): int
    {
        $ids = $dossiers->pluck('id')->filter()->values();

        if ($ids->isEmpty()) {
            return 0;
        }

        foreach (['dossier_documents', 'documents'] as $table) {
            if (Schema::hasTable($table) && Schema::hasColumn($table, 'dossier_id')) {
                return DB::table($table)
                    ->whereIn('dossier_id', $ids)
                    ->count();
            }
        }

        return 0;
    }
}