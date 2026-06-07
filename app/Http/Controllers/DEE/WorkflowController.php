<?php

namespace App\Http\Controllers\DEE;

use App\Http\Controllers\Controller;

use App\Models\Dossier;
use App\Models\DossierExpert;
use App\Models\Etablissement;
use App\Models\Expert;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class WorkflowController extends Controller
{
    public function affectations()
    {
        if (!Schema::hasTable('dossier_experts')) {
            return Inertia::render('DEE/Workflow/Affectations', ['dossiers' => []]);
        }

        $affectationStatuses = [
            'acces_envoye',
            'en_attente_confirmation_expert',
            'confirme_par_expert',
            'accepte_par_expert',
            'confirme',
            'comite_confirme',
            'visite_planifiee',
            'visite_realisee',
            'rapport_depose',
            'rapport_valide',
        ];

        $dossierIds = DossierExpert::query()
            ->whereIn('status', $affectationStatuses)
            ->pluck('dossier_id')
            ->unique()
            ->values();

        if ($dossierIds->isEmpty()) {
            return Inertia::render('DEE/Workflow/Affectations', ['dossiers' => []]);
        }

        $dossiers = Dossier::query()
            ->whereIn('id', $dossierIds)
            ->orderByDesc('updated_at')
            ->get();

        $etablissementIds = $dossiers->pluck('etablissement_id')->filter()->unique()->values();
        $etablissements = collect();

        if ($etablissementIds->isNotEmpty() && Schema::hasTable('etablissements')) {
            $etablissements = Etablissement::query()
                ->whereIn('id', $etablissementIds)
                ->get()
                ->keyBy('id');
        }

        $confirmedDossierExperts = DossierExpert::query()
            ->whereIn('dossier_id', $dossierIds)
            ->whereIn('status', $affectationStatuses)
            ->get();

        $expertIds = $confirmedDossierExperts->pluck('expert_id')->filter()->unique()->values();
        $experts = collect();

        if ($expertIds->isNotEmpty() && Schema::hasTable((new Expert())->getTable())) {
            $experts = Expert::query()->whereIn('id', $expertIds)->get()->keyBy('id');
        }

        $expertsByDossier = $confirmedDossierExperts->groupBy('dossier_id');

        $result = $dossiers->map(function ($dossier) use ($expertsByDossier, $etablissements, $experts) {
            $etablissement = $etablissements->get($dossier->etablissement_id);
            $dossierGroup = $expertsByDossier->get($dossier->id, collect());

            $expertsList = $dossierGroup->map(function ($de) use ($experts) {
                $expert = $experts->get($de->expert_id);
                $prenom = $expert ? ($expert->prenom ?? $expert->first_name ?? '') : '';
                $nom = $expert ? ($expert->nom ?? $expert->last_name ?? $expert->name ?? '') : '';
                $fullName = trim($prenom . ' ' . $nom) ?: ($expert ? ($expert->name ?? 'Expert') : 'Expert');
                return [
                    'id' => $de->id,
                    'role' => $de->role_expert ?? 'expert',
                    'status' => $de->status,
                    'name' => $fullName,
                    'email' => $expert ? ($expert->email ?? '') : '',
                ];
            })->values();

            $etablissementNom = $etablissement
                ? ($etablissement->etablissement_2 ?? $etablissement->etablissement ?? $etablissement->acronyme ?? '—')
                : $this->read($dossier, ['etablissement_nom', 'etablissement'], '—');

            return [
                'id' => $dossier->id,
                'reference' => $this->read($dossier, ['reference'], '—'),
                'nom' => $this->read($dossier, ['nom', 'name', 'titre'], $this->read($dossier, ['reference'], 'Dossier')),
                'statut' => $this->read($dossier, ['statut', 'status'], '—'),
                'etablissement' => $etablissementNom,
                'experts_count' => $expertsList->count(),
                'experts' => $expertsList,
                'url' => route('dee.dossiers.show', $dossier->id),
            ];
        })->values();

        return Inertia::render('DEE/Workflow/Affectations', ['dossiers' => $result]);
    }

    public function comites()
    {
        if (!Schema::hasTable('dossier_experts')) {
            return Inertia::render('DEE/Workflow/Comites', ['comites' => []]);
        }

        $confirmedExperts = DossierExpert::query()
            ->whereIn('status', [
                'acces_envoye',
                'en_attente_confirmation_expert',
                'confirme_par_expert',
                'accepte_par_expert',
                'confirme',
                'comite_confirme',
                'visite_planifiee',
                'visite_realisee',
                'rapport_depose',
                'rapport_valide',
            ])
            ->get();

        $groups = $confirmedExperts->groupBy('dossier_id');

        $eligibleDossierIds = $groups->filter(function ($expertGroup) {
            return $expertGroup->count() >= 1;
        })->keys();

        if ($eligibleDossierIds->isEmpty()) {
            return Inertia::render('DEE/Workflow/Comites', ['comites' => []]);
        }

        $dossiers = Dossier::query()
            ->whereIn('id', $eligibleDossierIds)
            ->orderByDesc('updated_at')
            ->get()
            ->keyBy('id');

        $etablissementIds = $dossiers->pluck('etablissement_id')->filter()->unique()->values();
        $etablissements = collect();

        if ($etablissementIds->isNotEmpty() && Schema::hasTable('etablissements')) {
            $etablissements = Etablissement::query()
                ->whereIn('id', $etablissementIds)
                ->get()
                ->keyBy('id');
        }

        $expertIds = $confirmedExperts
            ->whereIn('dossier_id', $eligibleDossierIds->toArray())
            ->pluck('expert_id')
            ->filter()
            ->unique()
            ->values();

        $experts = collect();
        if ($expertIds->isNotEmpty() && Schema::hasTable((new Expert())->getTable())) {
            $experts = Expert::query()->whereIn('id', $expertIds)->get()->keyBy('id');
        }

        $comites = $eligibleDossierIds->map(function ($dossierId) use ($dossiers, $groups, $experts, $etablissements) {
            $dossier = $dossiers->get($dossierId);
            if (!$dossier) return null;

            $etablissement = $etablissements->get($dossier->etablissement_id);
            $expertGroup = $groups->get($dossierId, collect());

            $expertsList = $expertGroup->map(function ($de) use ($experts) {
                $expert = $experts->get($de->expert_id);
                $prenom = $expert ? ($expert->prenom ?? $expert->first_name ?? '') : '';
                $nom = $expert ? ($expert->nom ?? $expert->last_name ?? $expert->name ?? '') : '';
                $fullName = trim($prenom . ' ' . $nom) ?: ($expert ? ($expert->name ?? 'Expert') : 'Expert');
                return [
                    'id' => $de->id,
                    'role' => $de->role_expert ?? 'expert',
                    'status' => $de->status,
                    'name' => $fullName,
                    'email' => $expert ? ($expert->email ?? '') : '',
                    'specialite' => $expert ? ($expert->specialite ?? $expert->domaine ?? '') : '',
                ];
            })->sortByDesc(fn($e) => $e['role'] === 'chef_comite' ? 1 : 0)->values();

            $etablissementNom = $etablissement
                ? ($etablissement->etablissement_2 ?? $etablissement->etablissement ?? $etablissement->acronyme ?? '—')
                : $this->read($dossier, ['etablissement_nom', 'etablissement'], '—');

            $universiteNom = $etablissement
                ? ($etablissement->universite ?? $etablissement->universite_nom ?? '—')
                : '—';

            return [
                'dossier_id' => $dossier->id,
                'reference' => $this->read($dossier, ['reference'], '—'),
                'nom' => $this->read($dossier, ['nom', 'name', 'titre'], $this->read($dossier, ['reference'], 'Dossier')),
                'etablissement' => $etablissementNom,
                'universite' => $universiteNom,
                'experts' => $expertsList,
                'experts_count' => $expertsList->count(),
                'chef' => $expertsList->firstWhere('role', 'chef_comite'),
                'url' => route('dee.dossiers.show', $dossier->id),
            ];
        })->filter()->values();

        return Inertia::render('DEE/Workflow/Comites', ['comites' => $comites]);
    }

    public function recommandations()
    {
        $dossiers = Dossier::query()
            ->orderByDesc('updated_at')
            ->get();

        $etablissementIds = $dossiers->pluck('etablissement_id')->filter()->unique()->values();
        $etablissements = collect();

        if ($etablissementIds->isNotEmpty() && Schema::hasTable('etablissements')) {
            $etablissements = Etablissement::query()
                ->whereIn('id', $etablissementIds)
                ->get()
                ->keyBy('id');
        }

        $expertCountByDossier = collect();
        if (Schema::hasTable('dossier_experts')) {
            $expertCountByDossier = DossierExpert::query()
                ->selectRaw('dossier_id, count(*) as total')
                ->groupBy('dossier_id')
                ->pluck('total', 'dossier_id');
        }

        $recommandationsByDossier = Schema::hasTable('recommandations_domaines')
            ? DB::table('recommandations_domaines')
                ->select('dossier_id', 'statut', 'statut_mise_en_oeuvre', 'updated_at')
                ->get()
                ->groupBy('dossier_id')
            : collect();

        $result = $dossiers->map(function ($dossier) use ($etablissements, $expertCountByDossier, $recommandationsByDossier) {
            $etablissement = $etablissements->get($dossier->etablissement_id);
            $recommandations = $recommandationsByDossier->get($dossier->id, collect());

            $etablissementNom = $etablissement
                ? ($etablissement->etablissement_2 ?? $etablissement->etablissement ?? $etablissement->acronyme ?? '—')
                : $this->read($dossier, ['etablissement_nom', 'etablissement'], '—');

            $total       = $recommandations->count();
            $soumises    = $recommandations->where('statut', 'soumise_dee')->count();
            $renvoyees   = $recommandations->where('statut', 'renvoyee_expert')->count();
            $validees    = $recommandations->where('statut', 'validee_dee')->count();
            $enSuivi     = $recommandations->whereIn('statut', ['envoyee_etablissement', 'en_cours'])->count();
            $realisees   = $recommandations->where('statut_mise_en_oeuvre', 'realisee')->count();
            $cloturees   = $recommandations->where('statut', 'cloturee')->count();

            [$statutRecommandations, $priorite] = match (true) {
                $soumises > 0                     => ['À réviser par la DEE', 6],
                $validees > 0                     => ['Validées, prêtes à envoyer', 5],
                $enSuivi > 0                      => ['Suivi établissement en cours', 4],
                $renvoyees > 0                    => ['En révision chez l’expert', 3],
                $total > 0 && $cloturees === $total => ['Toutes clôturées', 2],
                $total > 0                        => ['Brouillons expert', 1],
                default                           => ['Aucune recommandation', 0],
            };

            return [
                'id' => $dossier->id,
                'reference' => $this->read($dossier, ['reference'], '—'),
                'etablissement' => $etablissementNom,
                'campagne' => $this->read($dossier, ['campagne', 'campagne_reference'], '—'),
                'experts_count' => $expertCountByDossier->get($dossier->id, 0),
                'recommandations_count' => $total,
                'soumises_count' => $soumises,
                'renvoyees_count' => $renvoyees,
                'validees_count' => $validees,
                'suivi_count' => $enSuivi,
                'realisees_count' => $realisees,
                'cloturees_count' => $cloturees,
                'statut_recommandations' => $statutRecommandations,
                'priorite' => $priorite,
                'updated_at' => $recommandations->max('updated_at'),
                'url' => route('dee.recommandations-suivi.index', $dossier->id),
            ];
        })->sortByDesc('priorite')->values();

        return Inertia::render('DEE/Workflow/Recommandations', ['dossiers' => $result]);
    }

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
