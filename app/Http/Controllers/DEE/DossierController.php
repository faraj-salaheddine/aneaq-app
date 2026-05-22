<?php

namespace App\Http\Controllers\DEE;

use App\Http\Controllers\Controller;

use App\Models\Dossier;
use App\Models\DossierExpert;
use App\Models\DossierPhoto;
use App\Models\Etablissement;
use App\Models\Expert;
use App\Models\NotificationAneaq;
use App\Models\RapportExpert;
use App\Models\User;
use App\Services\ActivityLogger;
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
            'dossier'        => $this->dossierPayload($dossier, false),
            'experts'        => $this->availableExpertsPayload($dossier),
            'allExperts'     => $this->allExpertsPayload(),
            'dossierExperts' => $this->dossierExpertsPayload($dossier),
            'documents'      => $this->documentsPayload($dossier),
            'photos'         => $this->photosPayload($dossier),
            'rapportsExperts' => $this->rapportsExpertsPayload($dossier),
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
            ActivityLogger::log('dossier_mis_a_jour', "Dossier {$dossier->reference} mis à jour", $dossier);

            // Notify the établissement when a visit date is set or updated
            if ($request->has('date_visite') && !empty($validated['date_visite'])) {
                $etablissement = Etablissement::find($dossier->etablissement_id);
                if ($etablissement?->user_id) {
                    $dateFormatee = \Carbon\Carbon::parse($validated['date_visite'])->format('d/m/Y');
                    NotificationAneaq::envoyer(
                        $etablissement->user_id,
                        'visite',
                        'Date de visite planifiée',
                        "Une visite a été planifiée pour votre dossier {$dossier->reference} le {$dateFormatee}.",
                        'Dossier',
                        $dossier->id
                    );
                }
            }
        }

        if (class_exists(DossierStatusService::class)) {
            DossierStatusService::refresh($dossier->fresh());
        }

        return back()->with('success', 'Dossier mis à jour avec succès.');
    }

    public function destroy(Request $request, Dossier $dossier)
    {
        $request->validate([
            'delete_password' => ['required', 'string'],
        ], [
            'delete_password.required' => 'Le mot de passe de suppression est obligatoire.',
        ]);

        $expectedPassword = config('app.dee_delete_password');

        if (!$expectedPassword || !hash_equals($expectedPassword, $request->input('delete_password'))) {
            return back()->withErrors([
                'delete_password' => 'Mot de passe incorrect.',
            ]);
        }

        ActivityLogger::log('dossier_supprime', "Dossier {$dossier->reference} supprimé", $dossier);

        // Also log against the établissement so the event appears in historique after dossier deletion
        $etablissementModel = Etablissement::find($dossier->etablissement_id);
        if ($etablissementModel) {
            ActivityLogger::log('dossier_supprime', "Dossier {$dossier->reference} supprimé par la DEE", $etablissementModel);
        }

        // Remove the établissement from the vague so it can be re-added
        if (!empty($dossier->campagne_etablissement_id)) {
            DB::table('campagne_etablissements')
                ->where('id', $dossier->campagne_etablissement_id)
                ->delete();
        }

        $dossier->delete();

        return redirect()
            ->route('dee.dossiers.index')
            ->with('success', 'Le dossier a été supprimé avec succès.');
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
            'est_cloture' => !empty($dossier->cloture_at),

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

    private function allExpertsPayload()
    {
        if (!Schema::hasTable((new Expert())->getTable())) {
            return collect();
        }

        $query = Expert::query();
        $this->orderExperts($query);

        return $query->get()->map(function (Expert $expert) {
            $prenom = $this->value($expert, ['prenom', 'first_name'], '');
            $nom    = $this->value($expert, ['nom', 'last_name', 'name'], '');
            $fullName = trim($prenom . ' ' . $nom) ?: $this->value($expert, ['name', 'nom'], 'Expert');

            return [
                'id'            => $expert->id,
                'prenom'        => $prenom,
                'nom'           => $nom,
                'name'          => $fullName,
                'email'         => $this->value($expert, ['email'], ''),
                'ville'         => $this->value($expert, ['ville', 'city'], ''),
                'specialite'    => $this->value($expert, ['specialite', 'specialité', 'domaine', 'discipline'], ''),
                'etablissement' => $this->value($expert, ['etablissement', 'etablissement_nom', 'institution'], ''),
            ];
        })->values();
    }

    private function availableExpertsPayload(Dossier $dossier)
    {
        if (!Schema::hasTable((new Expert())->getTable())) {
            return collect();
        }

        // Collect all possible name variants of the dossier's establishment
        $etablissementId = $this->value($dossier, ['etablissement_id']);
        $etablissementNoms = [];

        if ($etablissementId && Schema::hasTable((new Etablissement())->getTable())) {
            $etab = Etablissement::find($etablissementId);
            if ($etab) {
                $nameCols = ['etablissement', 'etablissement_2', 'nom', 'name', 'acronyme', 'intitule', 'sigle'];
                foreach ($nameCols as $col) {
                    $val = $this->hasColumn('etablissements', $col) ? $etab->getAttribute($col) : null;
                    if ($val && trim($val) !== '' && trim($val) !== '—') {
                        $etablissementNoms[] = strtolower(trim($val));
                    }
                }
            }
        }

        $query = Expert::query();
        $this->orderExperts($query);

        // Only keep names long enough to avoid false matches (min 6 chars)
        $etabNomsLong = array_filter($etablissementNoms, fn($n) => mb_strlen($n) >= 6);

        return $query
            ->get()
            ->filter(function (Expert $expert) use ($etabNomsLong) {
                // If no usable establishment names, show all experts
                if (empty($etabNomsLong)) {
                    return true;
                }

                $expertEtab = strtolower(trim((string) $this->value($expert, ['etablissement', 'etablissement_nom', 'institution'], '')));

                // Experts with empty establishment field pass through
                if ($expertEtab === '') {
                    return true;
                }

                // Exclude experts whose establishment matches the dossier's establishment
                foreach ($etabNomsLong as $etabNom) {
                    if (str_contains($expertEtab, $etabNom) || str_contains($etabNom, $expertEtab)) {
                        return false;
                    }
                }

                return true;
            })
            ->map(function (Expert $expert) {
                $prenom = $this->value($expert, ['prenom', 'first_name'], '');
                $nom    = $this->value($expert, ['nom', 'last_name', 'name'], '');

                $fullName = trim($prenom . ' ' . $nom);

                if ($fullName === '') {
                    $fullName = $this->value($expert, ['name', 'nom'], 'Expert');
                }

                return [
                    'id'           => $expert->id,
                    'prenom'       => $prenom,
                    'nom'          => $nom,
                    'name'         => $fullName,
                    'email'        => $this->value($expert, ['email'], ''),
                    'ville'        => $this->value($expert, ['ville', 'city'], ''),
                    'specialite'   => $this->value($expert, ['specialite', 'specialité', 'domaine', 'discipline'], ''),
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

        $rows = $query->get();

        // Pre-load uploaders
        $userIds = $rows->pluck('uploaded_by')->filter()->unique()->values();
        $usersById = User::query()->whereIn('id', $userIds)->get()->keyBy('id');

        return $rows
            ->map(function ($document) use ($table, $usersById) {
                $path = $this->documentPath($document);

                $uploadedById   = $this->objectValue($document, ['uploaded_by'], null);
                $uploadedByRole = $this->objectValue($document, ['uploaded_by_role', 'depose_par'], null)
                    ?? ($table === 'dossier_documents' ? 'DEE' : null); // DEE is the only uploader in this table
                $uploaderUser   = $uploadedById ? $usersById->get($uploadedById) : null;

                // Determine category label
                $categorie = match (strtolower((string) $uploadedByRole)) {
                    'expert'        => 'Expert',
                    'etablissement' => 'Établissement',
                    'dee'           => 'DEE',
                    default         => $uploadedByRole ? ucfirst($uploadedByRole) : '—',
                };

                // Use real name when available; fall back to role label so "Déposé par" is never "—"
                $roleLabel = match (strtolower((string) $uploadedByRole)) {
                    'dee'           => 'Administrateur DEE',
                    'expert'        => 'Expert',
                    'etablissement' => 'Établissement',
                    default         => null,
                };
                $uploaderName = $uploaderUser?->name ?? $roleLabel ?? '—';

                // Fallback: infer display name from path if all name fields are empty
                $nomFallback = $path ? pathinfo(basename($path), PATHINFO_FILENAME) : 'Document';
                $nomFallback = str_replace(['_', '-'], ' ', $nomFallback);
                // Infer type from path segment if type columns are empty
                $typeFallback = $path ? $this->inferTypeFromPath($path) : 'document';

                return [
                    'id'            => $document->id,
                    'dossier_id'    => $document->dossier_id ?? null,

                    'type'  => $this->objectValue($document, ['type', 'document_type', 'type_document'], null) ?? $typeFallback,
                    'titre' => $this->objectValue($document, ['titre', 'title', 'nom', 'name'], null) ?? $nomFallback,
                    'nom'   => $this->objectValue($document, ['original_name', 'filename', 'nom', 'name', 'titre', 'title'], null) ?? $nomFallback,

                    'original_name' => $this->objectValue($document, ['original_name', 'filename', 'file_name'], null) ?? basename((string) $path),
                    'mime_type'     => $this->objectValue($document, ['mime_type'], null),
                    'size'          => $this->objectValue($document, ['size', 'file_size'], null),

                    'path'      => $path,
                    'file_path' => $path,
                    'url'       => $this->fileUrl($path),

                    'depose_par'       => $this->objectValue($document, ['depose_par', 'uploaded_by_role'], '—'),
                    'uploader_nom'     => $uploaderName,
                    'uploader_categorie' => $categorie,

                    'statut'     => $this->objectValue($document, ['statut', 'status'], 'Déposé'),
                    'status'     => $this->objectValue($document, ['status', 'statut'], 'Déposé'),

                    'created_at' => $this->formatDateDisplay($this->objectValue($document, ['created_at'])),
                    'updated_at' => $this->formatDateDisplay($this->objectValue($document, ['updated_at'])),

                    'table' => $table,
                ];
            })
            ->values();
    }

    private function rapportsExpertsPayload(Dossier $dossier)
    {
        if (!Schema::hasTable('rapports_experts')) {
            return collect();
        }

        $rapports = DB::table('rapports_experts')
            ->where('dossier_id', $dossier->id)
            ->orderByDesc('updated_at')
            ->get();

        if ($rapports->isEmpty()) {
            return collect();
        }

        $expertIds = $rapports->pluck('expert_id')->filter()->unique()->values();
        $experts   = Schema::hasTable('experts')
            ? Expert::query()->whereIn('id', $expertIds)->get()->keyBy('id')
            : collect();

        $validatorsIds = $rapports->pluck('valide_par')->filter()->unique()->values();
        $validators    = User::query()->whereIn('id', $validatorsIds)->get()->keyBy('id');

        return $rapports->map(function ($rapport) use ($experts, $validators) {
            $expert   = $experts->get($rapport->expert_id);
            $prenom   = $expert ? ($expert->prenom ?? $expert->first_name ?? '') : '';
            $nom      = $expert ? ($expert->nom ?? $expert->last_name ?? $expert->name ?? '') : '';
            $fullName = trim($prenom . ' ' . $nom) ?: ($expert ? ($expert->name ?? 'Expert') : 'Expert');

            $validateur = $validators->get($rapport->valide_par ?? 0);

            // Use fichier if file_path is empty (pending migration adds fichier column)
            $path = !empty($rapport->file_path) ? $rapport->file_path : ($rapport->fichier ?? null);

            return [
                'id'            => $rapport->id,
                'expert_id'     => $rapport->expert_id,
                'expert_nom'    => $fullName,
                'expert_email'  => $expert?->email ?? '—',

                'titre'         => $rapport->titre ?? 'Rapport expert',
                'commentaire'   => $rapport->commentaire ?? null,
                'original_name' => $rapport->original_name ?? basename((string) $path),
                'path'          => $path,
                'url'           => $this->fileUrl($path),

                'statut'        => $rapport->statut ?? 'depose',
                'motif_rejet'   => $rapport->motif_rejet ?? null,

                'valide_le'     => $rapport->valide_le ? $this->formatDateDisplay($rapport->valide_le) : null,
                'valide_par'    => $validateur?->name ?? null,

                'created_at'    => $this->formatDateDisplay($rapport->created_at),
            ];
        })->values();
    }

    private function photosPayload(Dossier $dossier)
    {
        if (!Schema::hasTable('dossier_photos')) {
            return collect();
        }

        return DossierPhoto::where('dossier_id', $dossier->id)
            ->latest()
            ->get()
            ->map(fn ($photo) => [
                'id'            => $photo->id,
                'url'           => Storage::disk('public')->url($photo->file_path),
                'original_name' => $photo->original_name,
                'mime_type'     => $photo->mime_type,
                'size'          => $photo->size,
                'created_at'    => $photo->created_at?->format('d/m/Y H:i'),
            ]);
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
                'domaine_connaissances' => $this->value($etablissement, ['domaine_connaissances'], null),
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

    private function inferTypeFromPath(?string $path): string
    {
        if (!$path) return 'document';

        $segment = strtolower(basename(dirname($path)));

        return match (true) {
            str_contains($segment, 'lettre')   => 'Lettre DEE',
            str_contains($segment, 'formulaire') => 'Formulaire',
            str_contains($segment, 'annexe')   => 'Annexe',
            str_contains($segment, 'rapport')  => 'Rapport',
            str_contains($segment, 'document') => 'Document',
            default                            => ucfirst($segment) ?: 'Document',
        };
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

        return asset('storage/' . $path);
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

    /**
     * Check if two specialty strings share at least one significant keyword.
     * Handles French plural/gender inflections by stripping trailing 's'.
     */
    private function keywordsMatch(string $a, string $b): bool
    {
        // Extract words >= 7 chars — avoids generic words like "etudes", "sciences", "lettres"
        $extractWords = function (string $text): array {
            $clean = preg_replace('/[^a-zàâçéèêëîïôûùüÿæœ\s]/i', ' ', $text);
            $words = preg_split('/\s+/', strtolower(trim($clean)));
            return array_filter($words, fn($w) => mb_strlen($w) >= 7);
        };

        $wordsA = $extractWords($a);

        foreach ($wordsA as $word) {
            // Try exact match, then without trailing 's' (plural)
            $stems = array_unique([$word, rtrim($word, 's'), rtrim($word, 'es')]);
            foreach ($stems as $stem) {
                if (mb_strlen($stem) >= 4 && str_contains($b, $stem)) {
                    return true;
                }
            }
        }

        // Also try words from $b in $a (in case domaine is more specific)
        $wordsB = $extractWords($b);

        foreach ($wordsB as $word) {
            $stems = array_unique([$word, rtrim($word, 's'), rtrim($word, 'es')]);
            foreach ($stems as $stem) {
                if (mb_strlen($stem) >= 4 && str_contains($a, $stem)) {
                    return true;
                }
            }
        }

        return false;
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