<?php

namespace App\Http\Controllers\Expert;

use App\Http\Controllers\Controller;
use App\Models\Expert;
use App\Models\Dossier;
use App\Models\CritereEvaluation;
use App\Models\MatriceRecommandation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class MatriceRecommandationController extends Controller
{
    public function index(Dossier $dossier): Response
    {
        $expert = Expert::where('user_id', Auth::id())->firstOrFail();
        $this->autoriser($expert, $dossier);

        $dossier->load('etablissement');

        $criteres = CritereEvaluation::whereNotNull('parent_id')
            ->orderBy('ordre')
            ->get(['id', 'code', 'libelle']);

        $recommandations = MatriceRecommandation::where('dossier_id', $dossier->id)
            ->where('expert_id', $expert->id)
            ->with('critere:id,code,libelle')
            ->orderBy('created_at')
            ->get();

        return Inertia::render('Expert/Matrice/Index', [
            'expert'          => $expert,
            'dossier'         => $dossier,
            'criteres'        => $criteres,
            'recommandations' => $recommandations,
            'dejaSoumis'      => $recommandations->where('statut', 'soumis')->isNotEmpty(),
        ]);
    }

    public function sauvegarder(Request $request, Dossier $dossier)
    {
        $expert = Expert::where('user_id', Auth::id())->firstOrFail();
        $this->autoriser($expert, $dossier);

        $request->validate([
            'lignes'                  => 'required|array|min:1',
            'lignes.*.id'             => 'nullable|integer',
            'lignes.*.critere_id'     => 'nullable|exists:criteres_evaluation,id',
            'lignes.*.constat'        => 'nullable|string|max:3000',
            'lignes.*.point_fort'     => 'nullable|string|max:3000',
            'lignes.*.point_faible'   => 'nullable|string|max:3000',
            'lignes.*.recommandation' => 'nullable|string|max:3000',
            'lignes.*.priorite'       => 'required|in:haute,moyenne,basse',
        ]);

        DB::transaction(function () use ($request, $dossier, $expert) {
            $ids = [];

            foreach ($request->lignes as $data) {
                $r = MatriceRecommandation::updateOrCreate(
                    [
                        'id'         => $data['id'] ?? null,
                        'dossier_id' => $dossier->id,
                        'expert_id'  => $expert->id,
                    ],
                    [
                        'critere_id'     => $data['critere_id'] ?? null,
                        'constat'        => $data['constat'] ?? null,
                        'point_fort'     => $data['point_fort'] ?? null,
                        'point_faible'   => $data['point_faible'] ?? null,
                        'recommandation' => $data['recommandation'] ?? null,
                        'priorite'       => $data['priorite'],
                        'statut'         => 'brouillon',
                    ]
                );
                $ids[] = $r->id;
            }

            // Supprime les lignes retirées par l'expert
            MatriceRecommandation::where('dossier_id', $dossier->id)
                ->where('expert_id', $expert->id)
                ->where('statut', 'brouillon')
                ->whereNotIn('id', $ids)
                ->delete();
        });

        return back()->with('success', 'Matrice sauvegardée.');
    }

    public function soumettre(Dossier $dossier)
    {
        $expert = Expert::where('user_id', Auth::id())->firstOrFail();
        $this->autoriser($expert, $dossier);

        $updated = MatriceRecommandation::where('dossier_id', $dossier->id)
            ->where('expert_id', $expert->id)
            ->where('statut', 'brouillon')
            ->update(['statut' => 'soumis']);

        abort_if($updated === 0, 422, 'Aucune recommandation à soumettre.');

        return redirect()->route('expert.dossiers.show', $dossier)
            ->with('success', 'Matrice soumise avec succès.');
    }

    private function autoriser(Expert $expert, Dossier $dossier): void
    {
        $ok = DB::table('expert_dossier')
            ->where('expert_id', $expert->id)
            ->where('dossier_id', $dossier->id)
            ->where('statut_participation', 'confirme')
            ->exists();

        abort_unless($ok, 403);
    }
}