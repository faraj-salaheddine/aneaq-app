<?php

namespace App\Http\Controllers\DEE;

use App\Http\Controllers\Controller;

use App\Models\Dossier;
use App\Models\DossierExpert;
use App\Models\DossierPhoto;
use App\Models\Etablissement;
use App\Models\EtablissementOnboarding;
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
        $documents       = $this->documentsPayload($dossier);
        $rapportsExperts = $this->rapportsExpertsPayload($dossier);
        $recommandations = $this->recommandationsPayload($dossier);

        return Inertia::render('DEE/Dossiers/Show', [
            'dossier'              => $this->dossierPayload($dossier, false),
            'experts'              => $this->availableExpertsPayload($dossier),
            'allExperts'           => $this->allExpertsPayload(),
            'dossierExperts'       => $this->dossierExpertsPayload($dossier),
            'documents'            => $documents,
            'photos'               => $this->photosPayload($dossier),
            'rapportsExperts'      => $rapportsExperts,
            'evaluationsAnnexes'   => $this->evaluationsAnnexesPayload($dossier),
            'expectedDocuments'    => $this->expectedDocumentsPayload($dossier, $documents, $rapportsExperts),
            'recommandations'      => $recommandations['items'],
            'recommandationsStats' => $recommandations['stats'],
            'recommandationsRappels' => $recommandations['rappels'],
            'recommandationsProchainRappel' => $recommandations['prochainRappel'],
        ]);
    }

    private function recommandationsPayload(Dossier $dossier): array
    {
        if (!Schema::hasTable('recommandations_domaines')) {
            return ['items' => [], 'stats' => [], 'rappels' => [], 'prochainRappel' => null];
        }

        $items = DB::table('recommandations_domaines')
            ->where('dossier_id', $dossier->id)
            ->orderBy('domaine_code')
            ->orderByDesc('created_at')
            ->get();

        $experts = Schema::hasTable('experts')
            ? DB::table('experts')
                ->whereIn('id', $items->pluck('expert_id')->filter()->unique())
                ->get()->keyBy('id')
            : collect();

        $preuves = Schema::hasTable('recommandation_preuves')
            ? DB::table('recommandation_preuves')
                ->whereIn('recommandation_id', $items->pluck('id'))
                ->orderByDesc('created_at')
                ->get()->groupBy('recommandation_id')
            : collect();

        $domaineCodes  = $items->pluck('domaine_code')->filter()->unique()->values();
        $domaineLabels = Schema::hasTable('criteres') && $domaineCodes->isNotEmpty()
            ? DB::table('criteres')
                ->whereIn('domaine', $domaineCodes)
                ->select('domaine', 'domaine_label')
                ->distinct()
                ->get()
                ->pluck('domaine_label', 'domaine')
            : collect();

        $mapped = $items->map(function ($item) use ($experts, $preuves, $dossier, $domaineLabels) {
            $expert = $experts->get($item->expert_id);
            $item->expert_nom = $expert
                ? trim(($expert->prenom ?? '') . ' ' . ($expert->nom ?? $expert->name ?? '')) ?: 'Expert'
                : 'Expert';
            $item->domaine_label = $domaineLabels->get($item->domaine_code, $item->domaine_code);
            $item->preuves = $preuves
                ->get($item->id, collect())
                ->map(fn ($p) => [
                    'id'          => $p->id,
                    'fichier_nom' => $p->fichier_nom,
                    'description' => $p->description,
                    'url'         => route('dee.recommandations-suivi.preuves.telecharger', [
                        'dossier' => $item->dossier_id,
                        'preuve'  => $p->id,
                    ]),
                ])->values()->toArray();
            $item->preuves_count = count($item->preuves);
            return (array) $item;
        })->toArray();

        $col = collect($mapped);
        $stats = [
            'total'    => count($mapped),
            'brouillon'=> $col->where('statut', 'brouillon')->count(),
            'soumises' => $col->where('statut', 'soumise_dee')->count(),
            'renvoyees'=> $col->where('statut', 'renvoyee_expert')->count(),
            'validees' => $col->where('statut', 'validee_dee')->count(),
            'envoyees' => $col->whereIn('statut', ['envoyee_etablissement', 'en_cours'])->count(),
            'cloturees'=> $col->where('statut', 'cloturee')->count(),
            'realisees'=> $col->where('statut_mise_en_oeuvre', 'realisee')->count(),
            'premiere_date_envoi' => $col->whereNotNull('date_envoi_etablissement')->min('date_envoi_etablissement'),
        ];

        $rappels = Schema::hasTable('recommandation_rappels')
            ? DB::table('recommandation_rappels')
                ->where('dossier_id', $dossier->id)
                ->orderByDesc('envoye_le')
                ->get()->map(fn ($r) => (array) $r)->toArray()
            : [];

        $prochainRappel = null;
        if (!empty($rappels)) {
            $prochainRappel = \Carbon\Carbon::parse($rappels[0]['envoye_le'])->addMonths(6)->format('Y-m-d');
        } elseif ($stats['premiere_date_envoi']) {
            $prochainRappel = \Carbon\Carbon::parse($stats['premiere_date_envoi'])->addMonths(6)->format('Y-m-d');
        }

        return ['items' => $mapped, 'stats' => $stats, 'rappels' => $rappels, 'prochainRappel' => $prochainRappel];
    }

    private function evaluationsAnnexesPayload(Dossier $dossier): array
    {
        $criteres = \App\Models\Critere::all()->keyBy('id');
        $etab     = $dossier->etablissement;

        if (!$etab) return [];

        $preuves = \App\Models\CriterePreuve::where('etablissement_id', $etab->id)
            ->where('existe', true)
            ->get()
            ->keyBy(fn ($p) => "{$p->critere_id}_{$p->preuve_index}");

        $evals = \App\Models\ExpertPreuveEvaluation::where('dossier_id', $dossier->id)
            ->where('statut', 'soumis')
            ->with('expert')
            ->get();

        if ($evals->isEmpty()) return [];

        $NOTE_LABELS = \App\Models\ExpertPreuveEvaluation::$NOTE_LABELS;

        return $evals->groupBy('expert_id')->map(function ($items, $expertId) use ($criteres, $preuves, $NOTE_LABELS, $dossier) {
            $expert = $items->first()->expert;

            /* Flat rows with full hierarchy fields */
            $rows = $items->map(function ($ev) use ($criteres, $preuves, $NOTE_LABELS, $dossier) {
                $critere = $criteres->get($ev->critere_id);
                $preuve  = $preuves->get("{$ev->critere_id}_{$ev->preuve_index}");
                return [
                    'domaine'        => $critere?->domaine,
                    'domaine_label'  => $critere?->domaine_label,
                    'champ'          => $critere?->champ,
                    'champ_label'    => $critere?->champ_label,
                    'reference'      => $critere?->reference,
                    'reference_label'=> $critere?->reference_label,
                    'critere_id'     => $ev->critere_id,
                    'critere_num'    => $critere?->critere_num,
                    'critere_label'  => $critere?->critere_label,
                    'preuve_index'   => $ev->preuve_index,
                    'preuve_label'   => $critere ? (collect($critere->preuves)[$ev->preuve_index] ?? null) : null,
                    'fichier_nom'    => $preuve?->fichier_nom,
                    'fichier_id'     => $preuve?->id,
                    'note'           => $ev->note,
                    'note_label'     => $NOTE_LABELS[$ev->note] ?? 'Non évalué',
                    'observation'    => $ev->observation,
                ];
            })->values();

            /* Build grouped hierarchy: domaine → champ → reference → critere → preuves */
            $grouped = $rows->groupBy('domaine')->map(function ($byDomaine, $domaine) {
                $first = $byDomaine->first();
                return [
                    'domaine'       => $domaine,
                    'domaine_label' => $first['domaine_label'],
                    'total'         => $byDomaine->count(),
                    'champs'        => $byDomaine->groupBy('champ')->map(function ($byChamp, $champ) {
                        $firstC = $byChamp->first();
                        return [
                            'champ'       => $champ,
                            'champ_label' => $firstC['champ_label'],
                            'total'       => $byChamp->count(),
                            'references'  => $byChamp->groupBy('reference')->map(function ($byRef, $reference) {
                                $firstR = $byRef->first();
                                return [
                                    'reference'       => $reference,
                                    'reference_label' => $firstR['reference_label'],
                                    'criteres'        => $byRef->groupBy('critere_id')->map(function ($byCritere) {
                                        $firstCr = $byCritere->first();
                                        return [
                                            'critere_id'    => $firstCr['critere_id'],
                                            'critere_num'   => $firstCr['critere_num'],
                                            'critere_label' => $firstCr['critere_label'],
                                            'preuves'       => $byCritere->sortBy('preuve_index')->values()->toArray(),
                                        ];
                                    })->values()->toArray(),
                                ];
                            })->values()->toArray(),
                        ];
                    })->values()->toArray(),
                ];
            })->sortBy('domaine')->values()->toArray();

            /* Per-note stats */
            $stats = [0 => 0, 1 => 0, 2 => 0, 3 => 0];
            foreach ($rows as $r) { if (isset($stats[$r['note']])) $stats[$r['note']]++; }

            /* SWOT par domaine pour cet expert */
            $swotRecords = \App\Models\SwotDomaine::where('dossier_id', $dossier->id)
                ->where('expert_id', $expertId)
                ->get()
                ->keyBy('domaine');

            /* Attacher SWOT à chaque domaine du grouped */
            $groupedWithSwot = array_map(function ($domaine) use ($swotRecords) {
                $sw = $swotRecords->get($domaine['domaine']);
                $domaine['swot'] = $sw ? [
                    'forces'       => $sw->forces,
                    'faiblesses'   => $sw->faiblesses,
                    'opportunites' => $sw->opportunites,
                    'menaces'      => $sw->menaces,
                    'statut'       => $sw->statut,
                ] : null;
                return $domaine;
            }, $grouped);

            return [
                'expert_id'  => $expertId,
                'expert_nom' => trim(($expert->prenom ?? '') . ' ' . ($expert->nom ?? '')),
                'soumis_le'  => $items->max('soumis_le')?->format('d/m/Y H:i'),
                'total'      => $rows->count(),
                'stats'      => $stats,
                'grouped'    => $groupedWithSwot,
            ];
        })->values()->toArray();
    }

    public function downloadAnnexe(Dossier $dossier, \App\Models\CriterePreuve $criterePreuve)
    {
        abort_if($criterePreuve->etablissement_id !== $dossier->etablissement_id, 403);
        $path = storage_path('app/public/' . $criterePreuve->fichier_path);
        abort_if(!file_exists($path), 404);
        return response()->download($path, $criterePreuve->fichier_nom);
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

        // Cascade: delete dossier_experts (expert affectations)
        if (Schema::hasTable('dossier_experts')) {
            DB::table('dossier_experts')->where('dossier_id', $dossier->id)->delete();
        }

        // Cascade: delete documents (and their files from disk)
        foreach (['dossier_documents', 'documents'] as $docTable) {
            if (Schema::hasTable($docTable)) {
                $docs = DB::table($docTable)->where('dossier_id', $dossier->id)->get();
                foreach ($docs as $doc) {
                    $path = $doc->file_path ?? $doc->path ?? $doc->fichier ?? null;
                    if ($path) {
                        if (\Illuminate\Support\Facades\Storage::disk('public')->exists($path)) {
                            \Illuminate\Support\Facades\Storage::disk('public')->delete($path);
                        } elseif (\Illuminate\Support\Facades\Storage::disk('local')->exists($path)) {
                            \Illuminate\Support\Facades\Storage::disk('local')->delete($path);
                        }
                    }
                }
                DB::table($docTable)->where('dossier_id', $dossier->id)->delete();
            }
        }

        // Cascade: delete rapports experts
        if (Schema::hasTable('rapports_experts')) {
            $rapports = DB::table('rapports_experts')->where('dossier_id', $dossier->id)->get();
            foreach ($rapports as $r) {
                $path = $r->fichier ?? $r->file_path ?? null;
                if ($path && \Illuminate\Support\Facades\Storage::disk('public')->exists($path)) {
                    \Illuminate\Support\Facades\Storage::disk('public')->delete($path);
                }
            }
            DB::table('rapports_experts')->where('dossier_id', $dossier->id)->delete();
        }

        // Cascade: delete messages
        if (Schema::hasTable('messages_dossier')) {
            DB::table('messages_dossier')->where('dossier_id', $dossier->id)->delete();
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
                    'motif_refus' => $item->motif_refus ?? null,
                    'expert_refused_at' => $item->expert_refused_at
                        ? \Carbon\Carbon::parse($item->expert_refused_at)->format('d/m/Y H:i')
                        : null,

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
            ->map(function ($document) use ($table, $usersById, $dossier) {
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
                    'url'          => route('dee.dossiers.documents.voir', [$dossier->id, $document->id]),
                    'download_url' => route('dee.dossiers.documents.telecharger', [$dossier->id, $document->id]),

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

    private function expectedDocumentsPayload(Dossier $dossier, $documents, $rapportsExperts): array
    {
        $formulaireComplete = Schema::hasTable('etablissement_onboardings')
            && EtablissementOnboarding::where('etablissement_id', $dossier->etablissement_id)
                ->where('statut', 'complete')
                ->exists();

        $rapportAutoevaluation = $documents->contains(function (array $document) {
            $texte = strtolower(implode(' ', array_filter([
                $document['type'] ?? null,
                $document['titre'] ?? null,
                $document['nom'] ?? null,
                $document['original_name'] ?? null,
            ])));

            return str_contains($texte, 'rapport_autoevaluation')
                || str_contains($texte, 'autoevaluation')
                || str_contains($texte, 'autoévaluation');
        });

        $annexesAttendues = Schema::hasTable('criteres')
            ? \App\Models\Critere::all()->sum(fn ($critere) => count($critere->preuves ?? []))
            : 0;

        $annexesDeposees = Schema::hasTable('critere_preuves')
            ? \App\Models\CriterePreuve::where('etablissement_id', $dossier->etablissement_id)
                ->where('existe', true)
                ->whereNotNull('fichier_path')
                ->count()
            : 0;

        $annexesStatut = $annexesDeposees > 0 && $annexesDeposees >= $annexesAttendues
            ? 'valid'
            : ($annexesDeposees > 0 ? 'progress' : 'waiting');

        return [
            'formulaire' => [
                'statut' => $formulaireComplete ? 'valid' : 'waiting',
                'detail' => $formulaireComplete ? 'Formulaire complété' : 'En attente',
            ],
            'rapport_autoevaluation' => [
                'statut' => $rapportAutoevaluation ? 'valid' : 'waiting',
                'detail' => $rapportAutoevaluation ? 'Document déposé' : 'En attente',
            ],
            'annexes' => [
                'statut' => $annexesStatut,
                'detail' => $annexesDeposees > 0
                    ? "{$annexesDeposees}/{$annexesAttendues} preuves déposées"
                    : 'En attente',
            ],
            'rapport_expert' => [
                'statut' => $rapportsExperts->isNotEmpty() ? 'valid' : 'waiting',
                'detail' => $rapportsExperts->isNotEmpty() ? 'Rapport déposé' : 'En attente',
            ],
        ];
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
            $onboarding = EtablissementOnboarding::where('etablissement_id', $etablissement->id)->first();

            return [
                'id'                    => $etablissement->id,
                'nom'                   => $this->value($etablissement, ['nom', 'etablissement_2', 'etablissement', 'name', 'intitule'], '—'),
                'acronyme'              => $this->value($etablissement, ['acronyme'], null),
                'type'                  => $this->value($etablissement, ['type', 'categorie'], '—'),
                'ville'                 => $this->value($etablissement, ['ville', 'city'], '—'),
                'universite'            => $this->value($etablissement, ['universite', 'universite_nom', 'university'], '—'),
                'email'                 => $this->value($etablissement, ['email'], '—'),
                'domaine_connaissances' => $this->value($etablissement, ['domaine_connaissances'], null),
                // Profil complété par l'établissement
                'adresse'               => $onboarding?->adresse,
                'site_web'              => $onboarding?->site_web,
                'telephone'             => $onboarding?->telephone,
                'responsable_nom'       => $onboarding?->responsable_nom,
                'responsable_fonction'  => $onboarding?->responsable_fonction,
                'responsable_email'     => $onboarding?->responsable_email,
                'responsable_telephone' => $onboarding?->responsable_telephone,
                'profil_complete'       => $onboarding?->statut === 'complete',
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
