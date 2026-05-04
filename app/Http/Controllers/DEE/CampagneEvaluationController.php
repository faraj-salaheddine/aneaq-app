<?php

namespace App\Http\Controllers\DEE;

use App\Http\Controllers\Controller;

use App\Models\CampagneEtablissement;
use App\Models\CampagneEvaluation;
use App\Models\Dossier;
use App\Models\Etablissement;
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
            }

            if ($this->hasColumn('campagne_evaluations', 'status')) {
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
            ->map(fn ($value) => trim($value))
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

        $etablissements = $campagneEtablissements
            ->map(function (CampagneEtablissement $item) use ($etablissementsById) {
                $etablissement = $etablissementsById->get($item->etablissement_id);

                return [
                    'id' => $item->id,
                    'campagne_evaluation_id' => $item->campagne_evaluation_id,
                    'etablissement_id' => $item->etablissement_id,

                    'status' => $this->read($item, ['status', 'statut'], 'en_attente_confirmation_dee'),
                    'statut' => $this->read($item, ['statut', 'status'], 'en_attente_confirmation_dee'),

                    'email' => $this->read($item, ['email'], $this->read($etablissement, ['email'], '')),
                    'access_sent_at' => $this->read($item, ['access_sent_at'], null),
                    'dossier_id' => $this->read($item, ['dossier_id'], null),
                    'dossier_reference' => $this->read($item, ['dossier_reference'], null),

                    'etablissement' => [
                        'id' => $etablissement?->id,
                        'nom' => $this->etablissementName($etablissement),
                        'type' => $this->etablissementType($etablissement),
                        'ville' => $this->read($etablissement, ['ville'], '—'),
                        'universite' => $this->read($etablissement, ['universite'], '—'),
                        'email' => $this->read($etablissement, ['email'], '—'),
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
                    'type' => $this->etablissementType($etablissement),
                    'ville' => $this->read($etablissement, ['ville'], '—'),
                    'universite' => $this->read($etablissement, ['universite'], '—'),
                    'email' => $this->read($etablissement, ['email'], '—'),
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
                'created_at' => optional($campagneEvaluation->created_at)->format('d/m/Y H:i'),
                'updated_at' => optional($campagneEvaluation->updated_at)->format('d/m/Y H:i'),
            ],

            'stats' => [
                'etablissements' => $etablissements->count(),
                'acces_envoyes' => $etablissements->where('status', 'acces_envoye')->count()
                    + $etablissements->where('status', 'compte_etablissement_cree')->count(),
                'dossiers' => $this->campagneDossiersCount($campagneEvaluation),
                'formulaires' => 0,
            ],

            'etablissements' => $etablissements,
            'availableEtablissements' => $availableEtablissements,
            'vocations' => $this->vocationsPayload(),
        ]);
    }

    public function update(Request $request, CampagneEvaluation $campagneEvaluation)
    {
        $validated = $request->validate([
            'annee' => ['sometimes', 'nullable', 'integer', 'min:2000', 'max:2100'],
            'vocation' => ['sometimes', 'nullable', 'string', 'max:255'],
            'observation' => ['sometimes', 'nullable', 'string'],
            'statut' => ['sometimes', 'nullable', 'string', 'max:255'],
            'status' => ['sometimes', 'nullable', 'string', 'max:255'],
        ]);

        $payload = [];

        foreach (['annee', 'vocation', 'observation', 'statut', 'status'] as $field) {
            if ($request->has($field) && $this->hasColumn('campagne_evaluations', $field)) {
                $payload[$field] = $validated[$field] ?? null;
            }
        }

        if (!empty($payload)) {
            $campagneEvaluation->forceFill($payload);
            $campagneEvaluation->save();
        }

        return back()->with('success', 'Vague mise à jour avec succès.');
    }

   public function destroy(Request $request, CampagneEvaluation $campagneEvaluation)
{
    $request->validate([
        'delete_password' => ['required', 'string'],
    ], [
        'delete_password.required' => 'Le mot de passe de suppression est obligatoire.',
    ]);

    $expectedPassword = env('DEE_DELETE_PASSWORD');

    if (!$expectedPassword || $request->delete_password !== $expectedPassword) {
        return back()->withErrors([
            'delete_password' => 'Mot de passe incorrect.',
        ]);
    }

    $campagneEvaluation->delete();

    return redirect()
        ->route('dee.campagnes.index')
        ->with('success', 'La vague a été supprimée avec succès.');
}

    private function attachEtablissementAutomatically(CampagneEvaluation $campagne, Etablissement $etablissement): void
    {
        $pivot = CampagneEtablissement::query()
            ->where('campagne_evaluation_id', $campagne->id)
            ->where('etablissement_id', $etablissement->id)
            ->first();

        if (!$pivot) {
            $pivot = new CampagneEtablissement();
            $pivot->campagne_evaluation_id = $campagne->id;
            $pivot->etablissement_id = $etablissement->id;
        }

        if ($this->hasColumn('campagne_etablissements', 'status')) {
            $pivot->status = 'en_attente_confirmation_dee';
        }

        if ($this->hasColumn('campagne_etablissements', 'statut')) {
            $pivot->statut = 'en_attente_confirmation_dee';
        }

        if ($this->hasColumn('campagne_etablissements', 'email')) {
            $pivot->email = $this->read($etablissement, ['email'], null);
        }

        if ($this->hasColumn('campagne_etablissements', 'created_by') && !$pivot->exists) {
            $pivot->created_by = Auth::id();
        }

        $pivot->save();
    }

    private function vocationsPayload()
    {
        $column = $this->etablissementVocationColumn();

        if (!$column) {
            return collect();
        }

        return Etablissement::query()
            ->select($column)
            ->whereNotNull($column)
            ->where($column, '!=', '')
            ->groupBy($column)
            ->orderBy($column)
            ->get()
            ->map(function ($row) use ($column) {
                $value = $row->{$column};

                return [
                    'value' => $value,
                    'label' => $value,
                    'count' => Etablissement::query()
                        ->where($column, $value)
                        ->count(),
                ];
            })
            ->values();
    }

    private function etablissementVocationColumn(): ?string
    {
        foreach ([
            'domaine_connaissances',
            'evaluation',
            'type',
            'vocation',
            'categorie',
            'category',
            'type_etablissement',
            'etablissement_type',
            'nature',
            'domaine',
            'secteur',
        ] as $column) {
            if ($this->hasColumn('etablissements', $column)) {
                return $column;
            }
        }

        return null;
    }

    private function generateReference(int $annee): string
    {
        $nextId = ((int) CampagneEvaluation::query()->max('id')) + 1;

        return 'VAG-'.$annee.'-'.str_pad((string) $nextId, 3, '0', STR_PAD_LEFT);
    }

    private function campagneEtablissementsCount(CampagneEvaluation $campagne): int
    {
        if (!Schema::hasTable('campagne_etablissements')) {
            return 0;
        }

        return CampagneEtablissement::query()
            ->where('campagne_evaluation_id', $campagne->id)
            ->count();
    }

    private function campagneDossiersCount(CampagneEvaluation $campagne): int
    {
        if (!Schema::hasTable('dossiers')) {
            return 0;
        }

        $query = Dossier::query();

        if ($this->hasColumn('dossiers', 'campagne_evaluation_id')) {
            return $query->where('campagne_evaluation_id', $campagne->id)->count();
        }

        if ($this->hasColumn('dossiers', 'campagne_id')) {
            return $query->where('campagne_id', $campagne->id)->count();
        }

        if ($this->hasColumn('dossiers', 'campagne') && $this->hasColumn('campagne_evaluations', 'reference')) {
            return $query->where('campagne', $campagne->reference)->count();
        }

        return 0;
    }

    private function etablissementName($etablissement): string
    {
        return $this->read($etablissement, [
            'etablissement_2',
            'etablissement',
            'nom',
            'name',
            'intitule',
            'acronyme',
        ], '—');
    }

    private function etablissementType($etablissement): string
    {
        return $this->read($etablissement, [
            'domaine_connaissances',
            'evaluation',
            'type',
            'vocation',
            'categorie',
            'category',
            'nature',
            'domaine',
            'secteur',
        ], '—');
    }

    private function orderColumnForEtablissements(): string
    {
        foreach (['etablissement_2', 'etablissement', 'nom', 'name', 'acronyme', 'id'] as $column) {
            if ($this->hasColumn('etablissements', $column)) {
                return $column;
            }
        }

        return 'id';
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

    private function hasColumn(string $table, string $column): bool
    {
        static $cache = [];

        $key = $table.'.'.$column;

        if (!array_key_exists($key, $cache)) {
            $cache[$key] = Schema::hasTable($table) && Schema::hasColumn($table, $column);
        }

        return $cache[$key];
    }
}