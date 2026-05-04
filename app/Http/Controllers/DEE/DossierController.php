<?php

namespace App\Http\Controllers\DEE;

use App\Http\Controllers\Controller;

use App\Models\Dossier;
use App\Models\DossierExpert;
use App\Models\Etablissement;
use App\Models\Expert;
use App\Models\User;
use App\Services\DossierStatusService;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DossierController extends Controller
{
    public function index(Request $request)
    {
        $search = trim($request->string('search')->toString());

        $query = Dossier::query();

        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                foreach (['reference', 'nom', 'statut', 'status', 'campagne', 'campagne_reference'] as $column) {
                    if ($this->hasDossierColumn($column)) {
                        $q->orWhere($column, 'like', "%{$search}%");
                    }
                }
            });
        }

        $this->orderLatest($query, (new Dossier())->getTable());

        $dossiers = $query
            ->get()
            ->map(fn (Dossier $dossier) => $this->dossierPayload($dossier, true))
            ->values();

        return Inertia::render('DEE/Dossiers/Index', [
            'dossiers' => $dossiers,
            'stats' => [
                'dossiers' => Dossier::count(),
                'visites_planifiees' => $this->hasDossierColumn('date_visite')
                    ? Dossier::whereNotNull('date_visite')->count()
                    : 0,
                'documents' => $this->documentsTotalCount(),
                'experts_affectes' => Schema::hasTable('dossier_experts')
                    ? DossierExpert::count()
                    : 0,
            ],
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function show(Dossier $dossier)
    {
        return Inertia::render('DEE/Dossiers/Show', [
            'dossier' => $this->dossierPayload($dossier, false),
            'experts' => $this->availableExpertsPayload(),
            'dossierExperts' => $this->dossierExpertsPayload($dossier),
            'documents' => $this->documentsPayload($dossier),
        ]);
    }

    public function update(Request $request, Dossier $dossier)
    {
        $validated = $request->validate([
            'description' => ['sometimes', 'nullable', 'string'],
            'observation' => ['sometimes', 'nullable', 'string'],
            'date_visite' => ['sometimes', 'nullable', 'date'],
            'statut' => ['sometimes', 'nullable', 'string', 'max:255'],
            'status' => ['sometimes', 'nullable', 'string', 'max:255'],
        ]);

        $hasChanges = false;

        if ($request->has('description') && $this->hasDossierColumn('description')) {
            $dossier->description = $validated['description'] ?? null;
            $hasChanges = true;
        }

        if ($request->has('observation') && $this->hasDossierColumn('observation')) {
            $dossier->observation = $validated['observation'] ?? null;
            $hasChanges = true;
        }

        if ($request->has('date_visite') && $this->hasDossierColumn('date_visite')) {
            $dossier->date_visite = $validated['date_visite'] ?? null;
            $hasChanges = true;
        }

        if ($request->has('statut') && $this->hasDossierColumn('statut')) {
            $dossier->statut = $validated['statut'] ?? $dossier->statut;
            $hasChanges = true;
        }

        if ($request->has('status') && $this->hasDossierColumn('status')) {
            $dossier->status = $validated['status'] ?? $dossier->status;
            $hasChanges = true;
        }

        if ($request->has('date_visite') && !empty($validated['date_visite'])) {
            if ($this->hasDossierColumn('statut')) {
                $dossier->statut = 'Date de visite planifiée';
                $hasChanges = true;
            }

            if ($this->hasDossierColumn('status')) {
                $dossier->status = 'Date de visite planifiée';
                $hasChanges = true;
            }
        }

        if ($hasChanges) {
            $dossier->save();
        }

        if (class_exists(DossierStatusService::class)) {
            DossierStatusService::refresh($dossier->fresh());
        }

        return back()->with('success', 'Dossier mis à jour avec succès.');
    }

    public function destroy(Dossier $dossier)
    {
        DB::transaction(function () use ($dossier) {
            if (Schema::hasTable('dossier_experts')) {
                DossierExpert::where('dossier_id', $dossier->id)->delete();
            }

            $this->deleteDossierDocuments($dossier);

            $dossier->delete();
        });

        return redirect()
            ->route('dee.dossiers.index')
            ->with('success', 'Dossier supprimé avec succès.');
    }

    private function dossierPayload(Dossier $dossier, bool $forIndex = false): array
    {
        $etablissement = $this->etablissementPayload($dossier);
        $etablissementNom = $etablissement['nom'] ?? '—';

        $campagneReference = $this->value($dossier, [
            'campagne',
            'campagne_reference',
        ], '—');

        return [
            'id' => $dossier->id,

            'reference' => $this->value($dossier, ['reference'], '—'),

            'nom' => $this->value(
                $dossier,
                ['nom', 'name', 'titre'],
                $this->value($dossier, ['reference'], 'Dossier')
            ),

            'campagne' => $campagneReference,
            'campagne_reference' => $campagneReference,

            'statut' => $this->value($dossier, ['statut', 'status'], 'Établissement sélectionné'),
            'status' => $this->value($dossier, ['status', 'statut'], 'Établissement sélectionné'),

            'description' => $this->value($dossier, ['description'], ''),
            'observation' => $this->value($dossier, ['observation', 'observations'], ''),

            'date_visite' => $this->formatDateDisplay($this->value($dossier, ['date_visite'])),
            'date_visite_value' => $this->formatDateInput($this->value($dossier, ['date_visite'])),

            'created_by' => $this->creatorName($dossier),
            'created_by_name' => $this->creatorName($dossier),

            'created_at' => $this->formatDateDisplay($dossier->created_at),
            'updated_at' => $this->formatDateDisplay($dossier->updated_at),

            'etablissement' => $forIndex ? $etablissementNom : $etablissement,
            'etablissement_obj' => $etablissement,

            'etablissement_id' => $etablissement['id'] ?? null,
            'etablissement_nom' => $etablissementNom,
            'ville' => $etablissement['ville'] ?? '—',
            'universite' => $etablissement['universite'] ?? '—',
            'email' => $etablissement['email'] ?? '—',
        ];
    }

    private function availableExpertsPayload()
    {
        if (!Schema::hasTable((new Expert())->getTable())) {
            return collect();
        }

        $query = Expert::query();

        $this->orderExperts($query);

        return $query
            ->get()
            ->map(function (Expert $expert) {
                $prenom = $this->value($expert, ['prenom', 'first_name'], '');
                $nom = $this->value($expert, ['nom', 'last_name', 'name'], '');

                $fullName = trim($prenom . ' ' . $nom);

                if ($fullName === '') {
                    $fullName = $this->value($expert, ['name', 'nom'], 'Expert');
                }

                return [
                    'id' => $expert->id,
                    'prenom' => $prenom,
                    'nom' => $nom,
                    'name' => $fullName,
                    'email' => $this->value($expert, ['email'], ''),
                    'ville' => $this->value($expert, ['ville', 'city'], ''),
                    'specialite' => $this->value($expert, ['specialite', 'specialité', 'domaine', 'discipline'], ''),
                    'etablissement' => $this->value($expert, ['etablissement', 'etablissement_nom', 'institution'], ''),
                ];
            })
            ->values();
    }

    private function dossierExpertsPayload(Dossier $dossier)
    {
        if (!Schema::hasTable('dossier_experts')) {
            return collect();
        }

        $query = DossierExpert::query()
            ->where('dossier_id', $dossier->id);

        $this->orderLatest($query, 'dossier_experts');

        $items = $query->get();

        $expertIds = $items
            ->pluck('expert_id')
            ->filter()
            ->unique()
            ->values();

        $expertsById = Expert::query()
            ->whereIn('id', $expertIds)
            ->get()
            ->keyBy('id');

        return $items
            ->map(function ($item) use ($expertsById) {
                $expert = $expertsById->get($item->expert_id);

                $prenom = $expert ? $this->value($expert, ['prenom', 'first_name'], '') : '';
                $nom = $expert ? $this->value($expert, ['nom', 'last_name', 'name'], '') : '';

                $expertName = trim($prenom . ' ' . $nom);

                if ($expertName === '') {
                    $expertName = $expert
                        ? $this->value($expert, ['name', 'nom'], 'Expert')
                        : 'Expert';
                }

                return [
                    'id' => $item->id,
                    'dossier_id' => $item->dossier_id,
                    'expert_id' => $item->expert_id,

                    'role_expert' => $this->value($item, ['role_expert', 'role'], 'expert'),
                    'status' => $this->value($item, ['status', 'statut'], 'en_attente_confirmation_dee'),
                    'statut' => $this->value($item, ['statut', 'status'], 'en_attente_confirmation_dee'),

                    'expert' => $expert ? [
                        'id' => $expert->id,
                        'prenom' => $prenom,
                        'nom' => $nom,
                        'name' => $expertName,
                        'email' => $this->value($expert, ['email'], ''),
                        'ville' => $this->value($expert, ['ville', 'city'], ''),
                        'specialite' => $this->value($expert, ['specialite', 'specialité', 'domaine', 'discipline'], ''),
                        'etablissement' => $this->value($expert, ['etablissement', 'etablissement_nom', 'institution'], ''),
                    ] : [
                        'id' => null,
                        'name' => 'Expert supprimé',
                        'email' => '',
                        'ville' => '',
                        'specialite' => '',
                        'etablissement' => '',
                    ],
                ];
            })
            ->values();
    }

    private function documentsPayload(Dossier $dossier)
    {
        $table = $this->documentsTable();

        if (!$table) {
            return collect();
        }

        $query = DB::table($table)
            ->where('dossier_id', $dossier->id);

        $this->orderLatestDb($query, $table);

        return $query
            ->get()
            ->map(function ($document) use ($table) {
                $path = $this->documentPath($document);

                return [
                    'id' => $document->id,
                    'dossier_id' => $document->dossier_id ?? null,

                    'type' => $this->objectValue($document, ['type', 'document_type'], 'document'),
                    'titre' => $this->objectValue($document, ['titre', 'title', 'nom', 'name'], 'Document'),
                    'nom' => $this->objectValue($document, ['nom', 'name', 'titre', 'title'], 'Document'),

                    'original_name' => $this->objectValue($document, ['original_name', 'filename', 'file_name'], null),
                    'mime_type' => $this->objectValue($document, ['mime_type'], null),
                    'size' => $this->objectValue($document, ['size', 'file_size'], null),

                    'path' => $path,
                    'file_path' => $path,
                    'url' => $this->fileUrl($path),

                    'depose_par' => $this->objectValue($document, ['depose_par', 'uploaded_by_role'], '—'),
                    'statut' => $this->objectValue($document, ['statut', 'status'], 'Déposé'),
                    'status' => $this->objectValue($document, ['status', 'statut'], 'Déposé'),

                    'created_at' => $this->formatDateDisplay($this->objectValue($document, ['created_at'])),
                    'updated_at' => $this->formatDateDisplay($this->objectValue($document, ['updated_at'])),

                    'table' => $table,
                ];
            })
            ->values();
    }

    private function etablissementPayload(Dossier $dossier): array
    {
        $etablissementId = $this->value($dossier, ['etablissement_id']);

        $etablissement = null;

        if ($etablissementId && Schema::hasTable((new Etablissement())->getTable())) {
            $etablissement = Etablissement::query()->find($etablissementId);
        }

        if ($etablissement) {
            return [
                'id' => $etablissement->id,
                'nom' => $this->value(
                    $etablissement,
                    ['nom', 'etablissement_2', 'etablissement', 'name', 'intitule'],
                    '—'
                ),
                'type' => $this->value($etablissement, ['type', 'categorie'], '—'),
                'ville' => $this->value($etablissement, ['ville', 'city'], '—'),
                'universite' => $this->value($etablissement, ['universite', 'universite_nom', 'university'], '—'),
                'email' => $this->value($etablissement, ['email'], '—'),
            ];
        }

        return [
            'id' => $etablissementId,
            'nom' => $this->value($dossier, ['etablissement_nom', 'etablissement', 'nom_etablissement'], '—'),
            'type' => '—',
            'ville' => $this->value($dossier, ['ville'], '—'),
            'universite' => $this->value($dossier, ['universite'], '—'),
            'email' => $this->value($dossier, ['email'], '—'),
        ];
    }

    private function creatorName(Dossier $dossier): string
    {
        $createdBy = $this->value($dossier, ['created_by', 'user_id']);

        if (!$createdBy) {
            return '—';
        }

        $user = User::query()->find($createdBy);

        return $user?->name ?? '—';
    }

    private function deleteDossierDocuments(Dossier $dossier): void
    {
        $table = $this->documentsTable();

        if (!$table) {
            return;
        }

        $documents = DB::table($table)
            ->where('dossier_id', $dossier->id)
            ->get();

        foreach ($documents as $document) {
            $path = $this->documentPath($document);

            if ($path && Storage::disk('public')->exists($path)) {
                Storage::disk('public')->delete($path);
            }
        }

        DB::table($table)
            ->where('dossier_id', $dossier->id)
            ->delete();
    }

    private function documentsTotalCount(): int
    {
        $table = $this->documentsTable();

        if (!$table) {
            return 0;
        }

        return DB::table($table)->count();
    }

    private function documentsTable(): ?string
    {
        foreach (['dossier_documents', 'documents'] as $table) {
            if (Schema::hasTable($table)) {
                return $table;
            }
        }

        return null;
    }

    private function documentPath(object $document): ?string
    {
        foreach (['path', 'file_path', 'fichier', 'document_path'] as $column) {
            if (property_exists($document, $column) && !empty($document->{$column})) {
                return $document->{$column};
            }
        }

        return null;
    }

    private function fileUrl(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        if (str_starts_with($path, '/storage/')) {
            return $path;
        }

        return Storage::disk('public')->url($path);
    }

    private function orderLatest(Builder $query, string $table): void
    {
        if ($this->hasColumn($table, 'updated_at')) {
            $query->latest('updated_at');
            return;
        }

        if ($this->hasColumn($table, 'created_at')) {
            $query->latest('created_at');
            return;
        }

        if ($this->hasColumn($table, 'id')) {
            $query->latest('id');
        }
    }

    private function orderLatestDb($query, string $table): void
    {
        if ($this->hasColumn($table, 'updated_at')) {
            $query->orderByDesc('updated_at');
            return;
        }

        if ($this->hasColumn($table, 'created_at')) {
            $query->orderByDesc('created_at');
            return;
        }

        if ($this->hasColumn($table, 'id')) {
            $query->orderByDesc('id');
        }
    }

    private function orderExperts(Builder $query): void
    {
        $table = (new Expert())->getTable();

        if ($this->hasColumn($table, 'nom')) {
            $query->orderBy('nom');
        }

        if ($this->hasColumn($table, 'prenom')) {
            $query->orderBy('prenom');
        }

        if (!$this->hasColumn($table, 'nom') && $this->hasColumn($table, 'name')) {
            $query->orderBy('name');
        }
    }

    private function hasDossierColumn(string $column): bool
    {
        return $this->hasColumn((new Dossier())->getTable(), $column);
    }

    private function hasColumn(string $table, string $column): bool
    {
        return in_array($column, $this->columns($table), true);
    }

    private function columns(string $table): array
    {
        static $columns = [];

        if (!isset($columns[$table])) {
            if (!Schema::hasTable($table)) {
                $columns[$table] = [];
            } else {
                $columns[$table] = Schema::getColumnListing($table);
            }
        }

        return $columns[$table];
    }

    private function value($model, array $columns, mixed $default = null): mixed
    {
        $table = method_exists($model, 'getTable') ? $model->getTable() : null;

        foreach ($columns as $column) {
            if ($table && !$this->hasColumn($table, $column)) {
                continue;
            }

            $value = $model->getAttribute($column);

            if ($value !== null && $value !== '') {
                return $value;
            }
        }

        return $default;
    }

    private function objectValue(object $object, array $columns, mixed $default = null): mixed
    {
        foreach ($columns as $column) {
            if (property_exists($object, $column) && $object->{$column} !== null && $object->{$column} !== '') {
                return $object->{$column};
            }
        }

        return $default;
    }

    private function formatDateDisplay($date): string
    {
        if (!$date) {
            return '—';
        }

        try {
            return Carbon::parse($date)->format('d/m/Y H:i');
        } catch (\Throwable $e) {
            return (string) $date;
        }
    }

    private function formatDateInput($date): string
    {
        if (!$date) {
            return '';
        }

        try {
            return Carbon::parse($date)->format('Y-m-d\TH:i');
        } catch (\Throwable $e) {
            return '';
        }
    }
}