<?php

namespace App\Http\Controllers\DEE;

use App\Http\Controllers\Controller;
use App\Models\CritereEvaluation;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CritereEvaluationController extends Controller
{
    public function index()
    {
        $axes = CritereEvaluation::axes()
            ->with(['enfants' => fn ($q) => $q->orderBy('ordre')])
            ->orderBy('ordre')
            ->get();

        return Inertia::render('DEE/Criteres/Index', [
            'axes' => $axes,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'parent_id' => 'nullable|exists:criteres_evaluation,id',
            'code'      => 'required|string|max:20|unique:criteres_evaluation,code',
            'libelle'   => 'required|string|max:255',
            'poids'     => 'required|numeric|min:0|max:100',
            'ordre'     => 'required|integer|min:0',
        ]);

        CritereEvaluation::create($data);

        return back()->with('success', 'Critère ajouté.');
    }

    public function update(Request $request, CritereEvaluation $critere)
    {
        $data = $request->validate([
            'code'    => 'required|string|max:20|unique:criteres_evaluation,code,' . $critere->id,
            'libelle' => 'required|string|max:255',
            'poids'   => 'required|numeric|min:0|max:100',
            'ordre'   => 'required|integer|min:0',
        ]);

        $critere->update($data);

        return back()->with('success', 'Critère mis à jour.');
    }

    public function destroy(CritereEvaluation $critere)
    {
        if ($critere->enfants()->exists()) {
            return back()->with('error', 'Impossible de supprimer un axe contenant des critères.');
        }
        if ($critere->evaluations()->exists() || $critere->recommandations()->exists()) {
            return back()->with('error', 'Ce critère est déjà utilisé dans des évaluations.');
        }

        $critere->delete();
        return back()->with('success', 'Critère supprimé.');
    }
}
