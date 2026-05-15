<?php

namespace App\Http\Controllers\DEE;

use App\Http\Controllers\Controller;
use App\Models\Dossier;
use App\Models\MatriceRecommandation;
use App\Models\EvaluationQuantitative;
use App\Models\RapportExpert;
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
}
