<?php

namespace App\Http\Controllers\Expert;

use App\Http\Controllers\Controller;
use App\Models\Critere;
use App\Models\CriterePreuve;
use App\Models\Dossier;
use App\Models\DossierExpert;
use App\Models\Expert;
use App\Models\ExpertPreuveEvaluation;
use App\Models\SwotDomaine;
use App\Services\ActivityLogger;
use App\Services\NotifierDee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class EvaluationAnnexeController extends Controller
{
    /* ── Vérification accès expert → dossier ── */
    private function expert(): Expert
    {
        return Expert::where('user_id', Auth::id())->firstOrFail();
    }

    private function autoriser(Expert $expert, Dossier $dossier): void
    {
        abort_unless(
            DossierExpert::where('dossier_id', $dossier->id)
                ->where('expert_id', $expert->id)
                ->exists(),
            403,
            "Vous n'êtes pas affecté à ce dossier."
        );
    }

    /* ── Liste des dossiers de l'expert (page d'entrée) ── */
    public function liste(): Response
    {
        $expert   = $this->expert();
        $dossiers = Dossier::whereHas('expertAssignments', fn ($q) => $q->where('expert_id', $expert->id))
            ->with('etablissement')
            ->latest()
            ->get()
            ->map(function ($d) use ($expert) {
                $total   = \App\Models\Critere::all()->sum(fn ($c) => count($c->preuves));
                $evalue  = ExpertPreuveEvaluation::where('dossier_id', $d->id)
                    ->where('expert_id', $expert->id)
                    ->whereNotNull('note')
                    ->count();
                $soumis  = ExpertPreuveEvaluation::where('dossier_id', $d->id)
                    ->where('expert_id', $expert->id)
                    ->where('statut', 'soumis')
                    ->exists();
                return [
                    'id'         => $d->id,
                    'reference'  => $d->reference,
                    'nom'        => $d->nom,
                    'etablissement' => $d->etablissement?->nom,
                    'statut'     => $d->statut,
                    'total'      => $total,
                    'evalue'     => $evalue,
                    'soumis'     => $soumis,
                ];
            });

        return Inertia::render('Expert/EvaluationAnnexe/Liste', [
            'expert'   => $expert,
            'dossiers' => $dossiers,
        ]);
    }

    /* ── Page principale : liste toutes les preuves avec leur évaluation ── */
    public function index(Dossier $dossier): Response
    {
        $expert = $this->expert();
        $this->autoriser($expert, $dossier);

        $dossier->load('etablissement');
        $etablissement = $dossier->etablissement;

        $criteres = Critere::all();

        /* Preuves soumises par l'établissement */
        $preuvesSoumises = CriterePreuve::where('etablissement_id', $etablissement->id)
            ->where('existe', true)
            ->get()
            ->groupBy('critere_id')
            ->map(fn ($g) => $g->keyBy('preuve_index'));

        /* Évaluations déjà saisies par l'expert */
        $evaluations = ExpertPreuveEvaluation::where('dossier_id', $dossier->id)
            ->where('expert_id', $expert->id)
            ->get()
            ->groupBy('critere_id')
            ->map(fn ($g) => $g->keyBy('preuve_index'));

        /* Construire la structure groupée identique à l'espace établissement */
        $grouped = $criteres->groupBy('domaine')->map(function ($parDomaine, $domaine) use ($preuvesSoumises, $evaluations) {
            $premier = $parDomaine->first();
            return [
                'domaine'       => $domaine,
                'domaine_label' => $premier->domaine_label,
                'champs'        => $parDomaine->groupBy('champ')->map(function ($parChamp, $champ) use ($preuvesSoumises, $evaluations) {
                    $premierChamp = $parChamp->first();
                    return [
                        'champ'       => $champ,
                        'champ_label' => $premierChamp->champ_label,
                        'references'  => $parChamp->groupBy('reference')->map(function ($criteres, $reference) use ($preuvesSoumises, $evaluations) {
                            $premiereRef = $criteres->first();
                            return [
                                'reference'       => $reference,
                                'reference_label' => $premiereRef->reference_label,
                                'criteres'        => $criteres->map(function ($critere) use ($preuvesSoumises, $evaluations) {
                                    $preuvesParIndex = $preuvesSoumises->get($critere->id, collect());
                                    $evsParIndex     = $evaluations->get($critere->id, collect());

                                    $preuves = collect($critere->preuves)->map(function ($label, $index) use ($preuvesParIndex, $evsParIndex) {
                                        $preuve = $preuvesParIndex->get($index);
                                        $ev     = $evsParIndex->get($index);
                                        return [
                                            'index'        => $index,
                                            'label'        => $label,
                                            'fichier_nom'  => $preuve?->fichier_nom,
                                            'fichier_id'   => $preuve?->id,
                                            'soumis'       => $preuve !== null,
                                            'note'         => $ev?->note,
                                            'observation'  => $ev?->observation,
                                            'statut'       => $ev?->statut ?? 'non_evalue',
                                        ];
                                    });

                                    $total   = $preuves->count();
                                    $evalue  = $preuves->filter(fn ($p) => $p['note'] !== null)->count();
                                    return [
                                        'id'            => $critere->id,
                                        'critere_num'   => $critere->critere_num,
                                        'critere_label' => $critere->critere_label,
                                        'preuves'       => $preuves,
                                        'total'         => $total,
                                        'evalue'        => $evalue,
                                    ];
                                })->values(),
                            ];
                        })->values(),
                    ];
                })->values(),
            ];
        })->values();

        $totalPreuves  = $criteres->sum(fn ($c) => count($c->preuves));
        $totalEvalues  = ExpertPreuveEvaluation::where('dossier_id', $dossier->id)
            ->where('expert_id', $expert->id)
            ->whereNotNull('note')
            ->count();
        $dejaSoumis    = ExpertPreuveEvaluation::where('dossier_id', $dossier->id)
            ->where('expert_id', $expert->id)
            ->where('statut', 'soumis')
            ->exists();

        /* SWOT par domaine */
        $swotRecords = SwotDomaine::where('dossier_id', $dossier->id)
            ->where('expert_id', $expert->id)
            ->get()
            ->keyBy('domaine');

        $swot = $criteres->pluck('domaine')->unique()->sort()->values()
            ->mapWithKeys(function ($domaine) use ($swotRecords, $criteres) {
                $rec = $swotRecords->get($domaine);
                $label = $criteres->firstWhere('domaine', $domaine)?->domaine_label;
                return [$domaine => [
                    'domaine'       => $domaine,
                    'domaine_label' => $label,
                    'forces'        => $rec?->forces ?? '',
                    'faiblesses'    => $rec?->faiblesses ?? '',
                    'opportunites'  => $rec?->opportunites ?? '',
                    'menaces'       => $rec?->menaces ?? '',
                    'statut'        => $rec?->statut ?? 'non_rempli',
                ]];
            });

        return Inertia::render('Expert/EvaluationAnnexe/Index', [
            'expert'       => $expert,
            'dossier'      => $dossier,
            'grouped'      => $grouped,
            'totalPreuves' => $totalPreuves,
            'totalEvalues' => $totalEvalues,
            'dejaSoumis'   => $dejaSoumis,
            'swot'         => $swot,
        ]);
    }

    /* ── Sauvegarde en lot (brouillon) — retourne JSON ── */
    public function sauvegarder(Request $request, Dossier $dossier)
    {
        $expert = $this->expert();
        $this->autoriser($expert, $dossier);

        $request->validate([
            'evaluations'                 => 'nullable|array|max:600',
            'evaluations.*.critere_id'    => 'required|exists:criteres,id',
            'evaluations.*.preuve_index'  => 'required|integer|min:0',
            'evaluations.*.note'          => 'nullable|integer|min:0|max:3',
            'evaluations.*.observation'   => 'nullable|string|max:3000',
            'swot'                        => 'nullable|array',
            'swot.*.domaine'              => 'required|string|max:5',
            'swot.*.domaine_label'        => 'nullable|string|max:255',
            'swot.*.forces'               => 'nullable|string|max:5000',
            'swot.*.faiblesses'           => 'nullable|string|max:5000',
            'swot.*.opportunites'         => 'nullable|string|max:5000',
            'swot.*.menaces'              => 'nullable|string|max:5000',
        ]);

        DB::transaction(function () use ($request, $dossier, $expert) {
            foreach ($request->evaluations ?? [] as $data) {
                ExpertPreuveEvaluation::updateOrCreate(
                    [
                        'dossier_id'   => $dossier->id,
                        'expert_id'    => $expert->id,
                        'critere_id'   => $data['critere_id'],
                        'preuve_index' => $data['preuve_index'],
                    ],
                    [
                        'note'        => $data['note'] ?? null,
                        'observation' => $data['observation'] ?? null,
                        'statut'      => 'brouillon',
                    ]
                );
            }

            foreach ($request->swot ?? [] as $s) {
                SwotDomaine::updateOrCreate(
                    ['dossier_id' => $dossier->id, 'expert_id' => $expert->id, 'domaine' => $s['domaine']],
                    [
                        'domaine_label' => $s['domaine_label'] ?? null,
                        'forces'        => $s['forces'] ?? null,
                        'faiblesses'    => $s['faiblesses'] ?? null,
                        'opportunites'  => $s['opportunites'] ?? null,
                        'menaces'       => $s['menaces'] ?? null,
                        'statut'        => 'brouillon',
                    ]
                );
            }
        });

        ActivityLogger::log('evaluation_annexe_brouillon', "Évaluation + SWOT sauvegardés (brouillon)", $expert);

        return response()->json(['success' => true]);
    }

    /* ── Publication vers le DEE ── */
    public function publier(Request $request, Dossier $dossier)
    {
        $expert = $this->expert();
        $this->autoriser($expert, $dossier);

        $request->validate([
            'evaluations'                 => 'nullable|array|max:600',
            'evaluations.*.critere_id'    => 'required|exists:criteres,id',
            'evaluations.*.preuve_index'  => 'required|integer|min:0',
            'evaluations.*.note'          => 'nullable|integer|min:0|max:3',
            'evaluations.*.observation'   => 'nullable|string|max:3000',
            'swot'                        => 'nullable|array',
            'swot.*.domaine'              => 'required|string|max:5',
            'swot.*.domaine_label'        => 'nullable|string|max:255',
            'swot.*.forces'               => 'nullable|string|max:5000',
            'swot.*.faiblesses'           => 'nullable|string|max:5000',
            'swot.*.opportunites'         => 'nullable|string|max:5000',
            'swot.*.menaces'              => 'nullable|string|max:5000',
        ]);

        DB::transaction(function () use ($request, $dossier, $expert) {
            $now = now();
            foreach ($request->evaluations ?? [] as $data) {
                ExpertPreuveEvaluation::updateOrCreate(
                    [
                        'dossier_id'   => $dossier->id,
                        'expert_id'    => $expert->id,
                        'critere_id'   => $data['critere_id'],
                        'preuve_index' => $data['preuve_index'],
                    ],
                    [
                        'note'        => $data['note'] ?? null,
                        'observation' => $data['observation'] ?? null,
                        'statut'      => 'soumis',
                        'soumis_le'   => $now,
                    ]
                );
            }

            foreach ($request->swot ?? [] as $s) {
                SwotDomaine::updateOrCreate(
                    ['dossier_id' => $dossier->id, 'expert_id' => $expert->id, 'domaine' => $s['domaine']],
                    [
                        'domaine_label' => $s['domaine_label'] ?? null,
                        'forces'        => $s['forces'] ?? null,
                        'faiblesses'    => $s['faiblesses'] ?? null,
                        'opportunites'  => $s['opportunites'] ?? null,
                        'menaces'       => $s['menaces'] ?? null,
                        'statut'        => 'soumis',
                    ]
                );
            }
        });

        /* Notifier le DEE */
        $total = count($request->evaluations);
        NotifierDee::pourDossier(
            $dossier,
            'evaluation_annexe',
            "Évaluation des annexes soumise — {$dossier->reference}",
            "L'expert {$expert->prenom} {$expert->nom} a soumis l'évaluation de {$total} annexes pour le dossier {$dossier->reference}.",
        );

        ActivityLogger::log('evaluation_annexe_soumise', "Évaluation des annexes soumise au DEE ({$total} preuves)", $expert);

        return response()->json(['success' => true, 'total' => $total]);
    }
}
