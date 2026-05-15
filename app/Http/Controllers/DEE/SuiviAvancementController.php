<?php

namespace App\Http\Controllers\DEE;

use App\Http\Controllers\Controller;
use App\Models\Dossier;
use App\Models\EvaluationQuantitative;
use App\Models\RapportExpert;
use App\Models\CritereEvaluation;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SuiviAvancementController extends Controller
{
    public function index(Request $request)
    {
        $search  = $request->get('search', '');
        $statut  = $request->get('statut', '');

        $totalCriteres = CritereEvaluation::count();

        $dossiers = Dossier::with([
                'etablissement:id,etablissement,etablissement_2,acronyme',
                'expertAssignments.expert:id,nom,prenom',
            ])
            ->when($search, fn ($q) => $q->whereHas('etablissement', fn ($q2) => $q2->where('etablissement_2', 'like', "%$search%")->orWhere('etablissement', 'like', "%$search%"))
                ->orWhere('reference', 'like', "%$search%"))
            ->when($statut, fn ($q) => $q->where('statut', $statut))
            ->orderByDesc('updated_at')
            ->get()
            ->map(function ($dossier) use ($totalCriteres) {
                $experts = $dossier->expertAssignments->map(function ($de) use ($dossier, $totalCriteres) {
                    $expertId   = $de->expert_id;
                    $dossierId  = $dossier->id;

                    $nbEvals    = EvaluationQuantitative::where('dossier_id', $dossierId)
                        ->where('expert_id', $expertId)->count();
                    $nbSoumis   = EvaluationQuantitative::where('dossier_id', $dossierId)
                        ->where('expert_id', $expertId)->where('statut', 'soumis')->count();
                    $rapport    = RapportExpert::where('dossier_id', $dossierId)
                        ->where('expert_id', $expertId)->first();

                    $evalPct = $totalCriteres > 0 ? round(($nbEvals / $totalCriteres) * 100) : 0;
                    $submitPct = $totalCriteres > 0 ? round(($nbSoumis / $totalCriteres) * 100) : 0;

                    $steps = [
                        ['label' => 'Invité',      'done' => true],
                        ['label' => 'Confirmé',    'done' => in_array($de->status, ['confirme_par_expert', 'comite_confirme', 'visite_planifiee', 'visite_realisee', 'rapport_depose', 'rapport_valide'])],
                        ['label' => 'Évaluations', 'done' => $nbSoumis > 0],
                        ['label' => 'Rapport',     'done' => $rapport !== null],
                        ['label' => 'Validé',      'done' => $rapport?->statut === 'valide'],
                    ];

                    $progress = round(collect($steps)->where('done', true)->count() / count($steps) * 100);

                    return [
                        'id'         => $de->id,
                        'expert'     => $de->expert ? ($de->expert->prenom . ' ' . $de->expert->nom) : 'Inconnu',
                        'role'       => $de->role_expert,
                        'status'     => $de->status,
                        'eval_pct'   => $evalPct,
                        'submit_pct' => $submitPct,
                        'has_rapport'=> $rapport !== null,
                        'rapport_statut' => $rapport?->statut,
                        'steps'      => $steps,
                        'progress'   => $progress,
                    ];
                });

                $avgProgress = $experts->count() > 0
                    ? round($experts->avg('progress'))
                    : 0;

                return [
                    'id'           => $dossier->id,
                    'reference'    => $dossier->reference,
                    'etablissement'=> $dossier->etablissement?->etablissement_2
                        ?? $dossier->etablissement?->etablissement
                        ?? $dossier->etablissement?->acronyme
                        ?? '—',
                    'statut'       => $dossier->statut,
                    'experts'      => $experts->values(),
                    'avg_progress' => $avgProgress,
                ];
            });

        $statuts = Dossier::select('statut')->distinct()->pluck('statut');

        return Inertia::render('DEE/SuiviAvancement', [
            'dossiers'      => $dossiers,
            'statuts'       => $statuts,
            'filters'       => compact('search', 'statut'),
            'totalCriteres' => $totalCriteres,
        ]);
    }
}
