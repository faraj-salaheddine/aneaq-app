<?php

namespace App\Http\Controllers\DEE;

use App\Http\Controllers\Controller;
use App\Models\CampagneEtablissement;
use App\Models\CampagneEvaluation;
use App\Models\Dossier;
use App\Models\Etablissement;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;

class CampagneEvaluationController extends Controller
{
    public function index(Request $request)
    {
        $statut = $request->string('statut')->toString();

        $query = CampagneEvaluation::query();

        if ($statut !== '') {
            if ($this->hasColumn('campagne_evaluations', 'statut')) {
                $query->where('statut', $statut);
            } elseif ($this->hasColumn('campagne_evaluations', 'status')) {
                $query->where('status', $statut);
            }
        }

        if ($this->hasColumn('campagne_evaluations', 'updated_at')) {
            $query->latest('updated_at');
        } else {
            $query->latest('id');
        }

        $campagnes = $query
            ->get()
            ->map(function (CampagneEvaluation $campagne) {
                return [
                    'id' => $campagne->id,
                    'reference' => $this->read($campagne, ['reference'], '—'),
                    'annee' => $this->read($campagne, ['annee'], '—'),
                    'vocation' => $this->read($campagne, ['vocation'], '—'),
                    'observation' => $this->read($campagne, ['observation'], ''),
                    'statut' => $this->read($campagne, ['statut', 'status'], 'brouillon'),
                    'status' => $this->read($campagne, ['status', 'statut'], 'brouillon'),
                    'created_at' => optional($campagne->created_at)->format('d/m/Y H:i'),
                    'updated_at' => optional($campagne->updated_at)->format('d/m/Y H:i'),
                    'etablissements_count' => $this->campagneEtablissementsCount($campagne),
                    'dossiers_count' => $this->campagneDossiersCount($campagne),
                ];
            })
            ->values();

        return Inertia::render('DEE/Campagnes/Index', [
            'campagnes' => $campagnes,
            'filters' => [
                'statut' => $statut,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('DEE/Campagnes/Create', [
            'vocations' => $this->vocationsPayload(),
            'defaultYear' => now()->year,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'annee' => ['required', 'integer', 'min:2000', 'max:2100'],
            'vocations' => ['required', 'array', 'min:1'],
            'vocations.*' => ['required', 'string', 'max:255'],
            'observation' => ['nullable', 'string'],
        ]);

        $selectedVocations = collect($validated['vocations'])
            ->filter()
            ->map(fn ($value) => trim((string) $value))
            ->unique()
            ->values();

        $vocationColumn = $this->etablissementVocationColumn();

        if (!$vocationColumn) {
            return back()->withErrors([
                'vocations' => "Aucune colonne de vocation n'a été trouvée dans la table établissements.",
            ]);
        }

        $etablissements = Etablissement::query()
            ->whereIn($vocationColumn, $selectedVocations)
            ->get();

        if ($etablissements->isEmpty()) {
            return back()->withErrors([
                'vocations' => 'Aucun établissement trouvé pour les vocations sélectionnées.',
            ]);
        }

        $campagne = DB::transaction(function () use ($validated, $selectedVocations, $etablissements) {
            $campagne = new CampagneEvaluation();

            $payload = [];

            if ($this->hasColumn('campagne_evaluations', 'reference')) {
                $payload['reference'] = $this->generateReference((int) $validated['annee']);
            }

            if ($this->hasColumn('campagne_evaluations', 'annee')) {
                $payload['annee'] = $validated['annee'];
            }

            if ($this->hasColumn('campagne_evaluations', 'vocation')) {
                $payload['vocation'] = $selectedVocations->implode(', ');
            }

            if ($this->hasColumn('campagne_evaluations', 'observation')) {
                $payload['observation'] = $validated['observation'] ?? null;
            }

            if ($this->hasColumn('campagne_evaluations', 'statut')) {
                $payload['statut'] = 'active';
            }

            if ($this->hasColumn('campagne_evaluations', 'status')) {
                $payload['status'] = 'active';
            }

            if ($this->hasColumn('campagne_evaluations', 'created_by')) {
                $payload['created_by'] = Auth::id();
            }

            if ($this->hasColumn('campagne_evaluations', 'created_by_name')) {
                $payload['created_by_name'] = Auth::user()?->name;
            }

            $campagne->forceFill($payload);
            $campagne->save();

            foreach ($etablissements as $etablissement) {
                $this->attachEtablissementAutomatically($campagne, $etablissement);
            }

            return $campagne;
        });

        return redirect()
            ->route('dee.campagnes.show', $campagne)
            ->with('success', 'Vague créée avec succès. '.$etablissements->count().' établissement(s) ajouté(s) automatiquement.');
    }

    public function show(CampagneEvaluation $campagneEvaluation)
    {
        $campagneEtablissements = CampagneEtablissement::query()
            ->where('campagne_evaluation_id', $campagneEvaluation->id)
            ->latest()
            ->get();

        $etablissementIds = $campagneEtablissements
            ->pluck('etablissement_id')
            ->filter()
            ->unique()
            ->values();

        $etablissementsById = Etablissement::query()
            ->whereIn('id', $etablissementIds)
            ->get()
            ->keyBy('id');

        /*
         * IMPORTANT :
         * Cette partie permet d’envoyer dossier_id au frontend.
         * Comme ça, l’icône dossier devient bleue et cliquable.
         */
        $dossiersQuery = Dossier::query();

        if ($this->hasColumn('dossiers', 'campagne_evaluation_id')) {
            $dossiersQuery->where('campagne_evaluation_id', $campagneEvaluation->id);
        }

        $dossiers = $dossiersQuery->get();

        $dossiersById = $dossiers->keyBy('id');

        $dossiersByRattachement = $this->hasColumn('dossiers', 'campagne_etablissement_id')
            ? $dossiers->whereNotNull('campagne_etablissement_id')->keyBy('campagne_etablissement_id')
            : collect();

        $dossiersByEtablissement = $this->hasColumn('dossiers', 'etablissement_id')
            ? $dossiers->whereNotNull('etablissement_id')->keyBy('etablissement_id')
            : collect();

        $etablissements = $campagneEtablissements
            ->map(function (CampagneEtablissement $item) use (
                $etablissementsById,
                $dossiersById,
                $dossiersByRattachement,
                $dossiersByEtablissement
            ) {
                $etablissement = $etablissementsById->get($item->etablissement_id);

                $dossierFromPivotId = null;

                if ($this->hasColumn('campagne_etablissements', 'dossier_id')) {
                    $pivotDossierId = $this->read($item, ['dossier_id'], null);

                    if ($pivotDossierId) {
                        $dossierFromPivotId = $dossiersById->get((int) $pivotDossierId);
                    }
                }

                $dossier = $dossierFromPivotId
                    ?? $dossiersByRattachement->get($item->id)
                    ?? $dossiersByEtablissement->get($item->etablissement_id);

                return [
                    'id' => $item->id,
                    'pivot_id' => $item->id,
                    'campagne_evaluation_id' => $item->campagne_evaluation_id,
                    'etablissement_id' => $item->etablissement_id,

                    'status' => $this->read($item, ['status', 'statut'], 'en_attente_confirmation_dee'),
                    'statut' => $this->read($item, ['statut', 'status'], 'en_attente_confirmation_dee'),

                    'email' => $this->read($item, ['email'], $this->read($etablissement, ['email'], '')),
                    'access_sent_at' => $this->dateValue($item, ['access_sent_at']),

                    'dossier_id' => $dossier?->id,
                    'dossier_reference' => $dossier?->reference,
                    'dossier' => $dossier ? [
                        'id' => $dossier->id,
                        'reference' => $this->read($dossier, ['reference'], '—'),
                        'nom' => $this->read($dossier, ['nom'], '—'),
                        'statut' => $this->read($dossier, ['statut', 'status'], '—'),
                        'date_visite' => $this->read($dossier, ['date_visite'], null),
                    ] : null,

                    'etablissement' => [
                        'id' => $etablissement?->id,
                        'nom' => $this->etablissementName($etablissement),
                        'type' => $this->etablissementType($etablissement),
                        'ville' => $this->read($etablissement, ['ville'], '—'),
                        'universite' => $this->read($etablissement, ['universite', 'universite_nom'], '—'),
                        'email' => $this->read($etablissement, ['email'], ''),
                        'acronyme' => $this->read($etablissement, ['acronyme'], '—'),
                        'evaluation' => $this->read($etablissement, ['evaluation'], '—'),
                    ],
                ];
            })
            ->values();

        $attachedIds = $etablissementIds->all();

        $availableEtablissements = Etablissement::query()
            ->whereNotIn('id', $attachedIds)
            ->orderBy($this->orderColumnForEtablissements())
            ->get()
            ->map(function (Etablissement $etablissement) {
                return [
                    'id' => $etablissement->id,
                    'nom' => $this->etablissementName($etablissement),
                    'name' => $this->etablissementName($etablissement),
                    'etablissement' => $this->read($etablissement, ['etablissement'], null),
                    'etablissement_2' => $this->read($etablissement, ['etablissement_2'], null),
                    'type' => $this->etablissementType($etablissement),
                    'vocation' => $this->read($etablissement, ['vocation'], null),
                    'domaine_connaissances' => $this->read($etablissement, ['domaine_connaissances'], null),
                    'ville' => $this->read($etablissement, ['ville'], '—'),
                    'universite' => $this->read($etablissement, ['universite', 'universite_nom'], '—'),
                    'email' => $this->read($etablissement, ['email'], ''),
                    'acronyme' => $this->read($etablissement, ['acronyme'], '—'),
                    'evaluation' => $this->read($etablissement, ['evaluation'], '—'),
                ];
            })
            ->values();

        return Inertia::render('DEE/Campagnes/Show', [
            'campagne' => [
                'id' => $campagneEvaluation->id,
                'reference' => $this->read($campagneEvaluation, ['reference'], '—'),
                'annee' => $this->read($campagneEvaluation, ['annee'], '—'),
                'vocation' => $this->read($campagneEvaluation, ['vocation'], '—'),
                'observation' => $this->read($campagneEvaluation, ['observation'], ''),
                'statut' => $this->read($campagneEvaluation, ['statut', 'status'], 'brouillon'),
                'status' => $this->read($campagneEvaluation, ['status', 'statut'], 'brouillon'),
                'created_by' => $this->creatorName($campagneEvaluation),
                'created_at' => optional($campagneEvaluation->created_at)->format('d/m/Y H:i'),
                'updated_at' => optional($campagneEvaluation->updated_at)->format('d/m/Y H:i'),
            ],
            'stats' => [
                'etablissements' => $etablissements->count(),
                'acces_envoyes' => $etablissements->filter(function ($item) {
                    $status = strtolower((string) ($item['statut'] ?? $item['status'] ?? ''));

                    return $status === 'acces_envoye'
                        || $status === 'compte_etablissement_cree'
                        || str_contains($status, 'acces')
                        || str_contains($status, 'accès')
                        || !empty($item['access_sent_at']);
                })->count(),
                'dossiers' => $etablissements->filter(fn ($item) => !empty($item['dossier_id']))->count(),
                'formulaires' => $etablissements->filter(function ($item) {
                    $status = strtolower((string) ($item['dossier']['statut'] ?? ''));

                    return str_contains($status, 'formulaire');
                })->count(),
            ],
            'etablissements' => $etablissements,
            'availableEtablissements' => $availableEtablissements,
        ]);
    }

    public function update(Request $request, CampagneEvaluation $campagneEvaluation)
    {
        $validated = $request->validate([
            'annee' => ['sometimes', 'required', 'integer', 'min:2000', 'max:2100'],
            'vocation' => ['sometimes', 'nullable', 'string', 'max:255'],
            'observation' => ['sometimes', 'nullable', 'string'],
            'statut' => ['sometimes', 'required', 'string', 'max:255'],
            'status' => ['sometimes', 'required', 'string', 'max:255'],
        ]);

        $payload = [];

        if (array_key_exists('annee', $validated) && $this->hasColumn('campagne_evaluations', 'annee')) {
            $payload['annee'] = $validated['annee'];
        }

        if (array_key_exists('vocation', $validated) && $this->hasColumn('campagne_evaluations', 'vocation')) {
            $payload['vocation'] = $validated['vocation'];
        }

        if (array_key_exists('observation', $validated) && $this->hasColumn('campagne_evaluations', 'observation')) {
            $payload['observation'] = $validated['observation'];
        }

        if (array_key_exists('statut', $validated) && $this->hasColumn('campagne_evaluations', 'statut')) {
            $payload['statut'] = $validated['statut'];
        }

        if (array_key_exists('status', $validated) && $this->hasColumn('campagne_evaluations', 'status')) {
            $payload['status'] = $validated['status'];
        }

        $campagneEvaluation->forceFill($payload);
        $campagneEvaluation->save();

        return back()->with('success', 'Vague mise à jour avec succès.');
    }

    public function destroy(Request $request, CampagneEvaluation $campagneEvaluation)
    {
        $request->validate([
            'delete_password' => ['required', 'string'],
        ], [
            'delete_password.required' => 'Le mot de passe de suppression est obligatoire.',
        ]);

        $expectedPassword = config('app.dee_delete_password', env('DEE_DELETE_PASSWORD'));

        if (!$expectedPassword || !hash_equals((string) $expectedPassword, (string) $request->input('delete_password'))) {
            return back()->withErrors([
                'delete_password' => 'Mot de passe incorrect.',
            ]);
        }

        DB::transaction(function () use ($campagneEvaluation) {
            $campagneEtablissementIds = CampagneEtablissement::query()
                ->where('campagne_evaluation_id', $campagneEvaluation->id)
                ->pluck('id')
                ->all();

            if (!empty($campagneEtablissementIds) && $this->hasColumn('dossiers', 'campagne_etablissement_id')) {
                Dossier::query()
                    ->whereIn('campagne_etablissement_id', $campagneEtablissementIds)
                    ->delete();
            }

            if ($this->hasColumn('dossiers', 'campagne_evaluation_id')) {
                Dossier::query()
                    ->where('campagne_evaluation_id', $campagneEvaluation->id)
                    ->delete();
            }

            CampagneEtablissement::query()
                ->where('campagne_evaluation_id', $campagneEvaluation->id)
                ->delete();

            $campagneEvaluation->delete();
        });

        return redirect()
            ->route('dee.campagnes.index')
            ->with('success', 'Vague supprimée avec succès.');
    }

    private function attachEtablissementAutomatically(CampagneEvaluation $campagne, Etablissement $etablissement): CampagneEtablissement
    {
        $existing = CampagneEtablissement::query()
            ->where('campagne_evaluation_id', $campagne->id)
            ->where('etablissement_id', $etablissement->id)
            ->first();

        if ($existing) {
            return $existing;
        }

        $item = new CampagneEtablissement();

        if ($this->hasColumn('campagne_etablissements', 'campagne_evaluation_id')) {
            $item->campagne_evaluation_id = $campagne->id;
        }

        if ($this->hasColumn('campagne_etablissements', 'etablissement_id')) {
            $item->etablissement_id = $etablissement->id;
        }

        if ($this->hasColumn('campagne_etablissements', 'statut')) {
            $item->statut = 'en_attente_confirmation_dee';
        }

        if ($this->hasColumn('campagne_etablissements', 'status')) {
            $item->status = 'en_attente_confirmation_dee';
        }

        if ($this->hasColumn('campagne_etablissements', 'email')) {
            $item->email = $this->read($etablissement, ['email'], null);
        }

        if ($this->hasColumn('campagne_etablissements', 'access_sent_at')) {
            $item->access_sent_at = null;
        }

        if ($this->hasColumn('campagne_etablissements', 'created_by')) {
            $item->created_by = Auth::id();
        }

        $item->save();

        return $item;
    }

    private function vocationsPayload()
    {
        $column = $this->etablissementVocationColumn();

        if (!$column) {
            return [];
        }

        return Etablissement::query()
            ->select($column)
            ->whereNotNull($column)
            ->where($column, '!=', '')
            ->get()
            ->groupBy($column)
            ->map(function ($items, $value) {
                return [
                    'value' => $value,
                    'label' => $value,
                    'count' => $items->count(),
                ];
            })
            ->values();
    }

    private function etablissementVocationColumn(): ?string
    {
        foreach ([
            'vocation',
            'type',
            'type_etablissement',
            'domaine_connaissances',
            'evaluation',
            'etablissement',
        ] as $column) {
            if ($this->hasColumn('etablissements', $column)) {
                return $column;
            }
        }

        return null;
    }

    private function orderColumnForEtablissements(): string
    {
        foreach (['nom', 'etablissement_2', 'etablissement', 'name', 'id'] as $column) {
            if ($this->hasColumn('etablissements', $column)) {
                return $column;
            }
        }

        return 'id';
    }

    private function etablissementName(?Etablissement $etablissement): string
    {
        return $this->read($etablissement, [
            'nom',
            'name',
            'etablissement_2',
            'etablissement',
            'acronyme',
        ], '—');
    }

    private function etablissementType(?Etablissement $etablissement): string
    {
        return $this->read($etablissement, [
            'type',
            'type_etablissement',
            'vocation',
            'domaine_connaissances',
            'evaluation',
        ], '—');
    }

    private function campagneEtablissementsCount(CampagneEvaluation $campagne): int
    {
        return CampagneEtablissement::query()
            ->where('campagne_evaluation_id', $campagne->id)
            ->count();
    }

    private function campagneDossiersCount(CampagneEvaluation $campagne): int
    {
        if (!$this->hasColumn('dossiers', 'campagne_evaluation_id')) {
            return 0;
        }

        return Dossier::query()
            ->where('campagne_evaluation_id', $campagne->id)
            ->count();
    }

    private function generateReference(int $annee): string
    {
        $nextNumber = ((int) CampagneEvaluation::query()
            ->where('reference', 'like', 'VAG-'.$annee.'-%')
            ->count()) + 1;

        do {
            $reference = 'VAG-'.$annee.'-'.str_pad((string) $nextNumber, 3, '0', STR_PAD_LEFT);

            $exists = CampagneEvaluation::query()
                ->where('reference', $reference)
                ->exists();

            $nextNumber++;
        } while ($exists);

        return $reference;
    }

    private function creatorName(CampagneEvaluation $campagne): string
    {
        $createdByName = $this->read($campagne, ['created_by_name'], null);

        if ($createdByName) {
            return $createdByName;
        }

        $createdBy = $this->read($campagne, ['created_by'], null);

        if ($createdBy) {
            return User::query()->where('id', $createdBy)->value('name') ?? '—';
        }

        return '—';
    }

    private function read($model, array $columns, $default = '—')
    {
        if (!$model) {
            return $default;
        }

        foreach ($columns as $column) {
            $value = $model->getAttribute($column);

            if ($value !== null && $value !== '') {
                return $value;
            }
        }

        return $default;
    }

    private function dateValue($model, array $columns)
    {
        if (!$model) {
            return null;
        }

        foreach ($columns as $column) {
            $value = $model->getAttribute($column);

            if ($value) {
                if ($value instanceof \Carbon\Carbon) {
                    return $value->format('d/m/Y H:i');
                }

                return (string) $value;
            }
        }

        return null;
    }

    private function hasColumn(string $table, string $column): bool
    {
        return Schema::hasColumn($table, $column);
    }
}