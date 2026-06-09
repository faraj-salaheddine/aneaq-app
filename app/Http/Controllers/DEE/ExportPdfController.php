<?php

namespace App\Http\Controllers\DEE;

use App\Http\Controllers\Controller;
use App\Models\Critere;
use App\Models\CriterePreuve;
use App\Models\Dossier;
use App\Models\EvaluationQuantitative;
use App\Models\ExpertPreuveEvaluation;
use App\Models\MatriceRecommandation;
use App\Models\RapportExpert;
use App\Models\SwotDomaine;
use Barryvdh\DomPDF\Facade\Pdf;

class ExportPdfController extends Controller
{
    public function matrice(Dossier $dossier)
    {
        $dossier->load('etablissement');

        $recommandations = MatriceRecommandation::where('dossier_id', $dossier->id)
            ->with(['expert:id,nom,prenom', 'critere:id,code,libelle,domaine'])
            ->orderBy('priorite')
            ->orderBy('critere_id')
            ->get();

        $pdf = Pdf::loadView('pdf.matrice', compact('dossier', 'recommandations'))
            ->setPaper('a4', 'landscape');

        return $pdf->download("matrice-recommandations-{$dossier->reference}.pdf");
    }

    public function rapport(Dossier $dossier)
    {
        $dossier->load('etablissement');

        $evaluations = EvaluationQuantitative::where('dossier_id', $dossier->id)
            ->where('statut', 'soumis')
            ->with(['expert:id,nom,prenom', 'critere:id,code,libelle,domaine'])
            ->orderBy('critere_id')
            ->get();

        $rapports = RapportExpert::where('dossier_id', $dossier->id)
            ->with('expert:id,nom,prenom')
            ->get();

        $recommandations = MatriceRecommandation::where('dossier_id', $dossier->id)
            ->with(['expert:id,nom,prenom', 'critere:id,code,libelle'])
            ->orderBy('priorite')
            ->get();

        $notesMoyennes = $evaluations->groupBy('critere_id')->map(fn ($g) => round($g->avg('note'), 2));

        $pdf = Pdf::loadView('pdf.rapport', compact('dossier', 'evaluations', 'rapports', 'recommandations', 'notesMoyennes'))
            ->setPaper('a4', 'portrait');

        return $pdf->download("rapport-{$dossier->reference}.pdf");
    }

    public function evaluationAnnexes(Dossier $dossier)
    {
        $dossier->load('etablissement');

        $evaluationsAnnexes = [];
        $etab = $dossier->etablissement;

        if ($etab) {
            $criteres = Critere::all()->keyBy('id');

            $preuves = CriterePreuve::where('etablissement_id', $etab->id)
                ->where('existe', true)
                ->get()
                ->keyBy(fn ($p) => "{$p->critere_id}_{$p->preuve_index}");

            $evals = ExpertPreuveEvaluation::where('dossier_id', $dossier->id)
                ->where('statut', 'soumis')
                ->with('expert')
                ->get();

            if ($evals->isNotEmpty()) {
                $NOTE_LABELS = ExpertPreuveEvaluation::$NOTE_LABELS;

                $evaluationsAnnexes = $evals->groupBy('expert_id')->map(function ($items, $expertId) use ($criteres, $preuves, $NOTE_LABELS, $dossier) {
                    $expert = $items->first()->expert;

                    $rows = $items->map(function ($ev) use ($criteres, $preuves, $NOTE_LABELS) {
                        $critere = $criteres->get($ev->critere_id);
                        $preuve  = $preuves->get("{$ev->critere_id}_{$ev->preuve_index}");
                        return [
                            'domaine'         => $critere?->domaine,
                            'domaine_label'   => $critere?->domaine_label,
                            'champ'           => $critere?->champ,
                            'champ_label'     => $critere?->champ_label,
                            'reference'       => $critere?->reference,
                            'reference_label' => $critere?->reference_label,
                            'critere_id'      => $ev->critere_id,
                            'critere_num'     => $critere?->critere_num,
                            'critere_label'   => $critere?->critere_label,
                            'preuve_index'    => $ev->preuve_index,
                            'preuve_label'    => $critere ? (collect($critere->preuves)[$ev->preuve_index] ?? null) : null,
                            'fichier_nom'     => $preuve?->fichier_nom,
                            'note'            => $ev->note,
                            'note_label'      => $NOTE_LABELS[$ev->note] ?? 'Non évalué',
                            'observation'     => $ev->observation,
                        ];
                    })->values();

                    $swotRecords = SwotDomaine::where('dossier_id', $dossier->id)
                        ->where('expert_id', $expertId)
                        ->get()
                        ->keyBy('domaine');

                    $grouped = $rows->groupBy('domaine')->map(function ($byDomaine, $domaine) use ($swotRecords) {
                        $first = $byDomaine->first();
                        $sw    = $swotRecords->get($domaine);

                        return [
                            'domaine'       => $domaine,
                            'domaine_label' => $first['domaine_label'],
                            'total'         => $byDomaine->count(),
                            'swot'          => $sw ? [
                                'forces'       => $sw->forces,
                                'faiblesses'   => $sw->faiblesses,
                                'opportunites' => $sw->opportunites,
                                'menaces'      => $sw->menaces,
                            ] : null,
                            'champs' => $byDomaine->groupBy('champ')->map(function ($byChamp) {
                                $firstC = $byChamp->first();
                                return [
                                    'champ'       => $firstC['champ'],
                                    'champ_label' => $firstC['champ_label'],
                                    'total'       => $byChamp->count(),
                                    'references'  => $byChamp->groupBy('reference')->map(function ($byRef) {
                                        $firstR = $byRef->first();
                                        return [
                                            'reference'       => $firstR['reference'],
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

                    $stats = [0 => 0, 1 => 0, 2 => 0, 3 => 0];
                    foreach ($rows as $r) {
                        if (isset($stats[$r['note']])) $stats[$r['note']]++;
                    }

                    return [
                        'expert_id'  => $expertId,
                        'expert_nom' => trim(($expert->prenom ?? '') . ' ' . ($expert->nom ?? '')),
                        'soumis_le'  => $items->max('soumis_le')?->format('d/m/Y H:i'),
                        'total'      => $rows->count(),
                        'stats'      => $stats,
                        'grouped'    => $grouped,
                    ];
                })->values()->toArray();
            }
        }

        $pdf = Pdf::loadView('pdf.evaluation_annexes', compact('dossier', 'evaluationsAnnexes'))
            ->setPaper('a4', 'portrait');

        return $pdf->download("evaluation-annexes-{$dossier->reference}.pdf");
    }
}
