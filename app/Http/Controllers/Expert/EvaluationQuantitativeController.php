<?php

namespace App\Http\Controllers\Expert;

use App\Http\Controllers\Controller;
use App\Models\Expert;
use App\Models\Dossier;
use App\Models\CritereEvaluation;
use App\Models\EvaluationQuantitative;
use App\Models\NotificationAneaq;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;


// ═══════════════════════════════════════════════════════════════
// EvaluationQuantitativeController
// ═══════════════════════════════════════════════════════════════
class EvaluationQuantitativeController extends Controller
{
    public function index(Dossier $dossier): Response
    {
        $expert = Expert::where('user_id', Auth::id())->firstOrFail();
        $this->autoriser($expert, $dossier);

        $dossier->load('etablissement');

        $axes = CritereEvaluation::whereNull('parent_id')
            ->with(['enfants' => fn($q) => $q->orderBy('ordre')])
            ->orderBy('ordre')->get();

        $evaluations = EvaluationQuantitative::where('dossier_id', $dossier->id)
            ->where('expert_id', $expert->id)
            ->get()->keyBy('critere_id');

        $totalCriteres  = CritereEvaluation::whereNotNull('parent_id')->count();
        $criteresSaisis = $evaluations->whereNotNull('note')->count();

        return Inertia::render('Expert/Evaluations/Index', [
            'expert'      => $expert,
            'dossier'     => $dossier,
            'axes'        => $axes,
            'evaluations' => $evaluations,
            'progression' => $totalCriteres > 0 ? round(($criteresSaisis / $totalCriteres) * 100) : 0,
            'dejaSoumis'  => $evaluations->where('statut', 'soumis')->isNotEmpty(),
        ]);
    }

    public function sauvegarder(Request $request, Dossier $dossier)
    {
        $expert = Expert::where('user_id', Auth::id())->firstOrFail();
        $this->autoriser($expert, $dossier);

        $request->validate([
            'evaluations'              => 'required|array',
            'evaluations.*.critere_id' => 'required|exists:criteres_evaluation,id',
            'evaluations.*.note'       => 'nullable|integer|min:1|max:5',
            'evaluations.*.commentaire'=> 'nullable|string|max:2000',
        ]);

        DB::transaction(function () use ($request, $dossier, $expert) {
            foreach ($request->evaluations as $data) {
                EvaluationQuantitative::updateOrCreate(
                    ['dossier_id'=>$dossier->id,'expert_id'=>$expert->id,'critere_id'=>$data['critere_id']],
                    ['note'=>$data['note']??null,'commentaire'=>$data['commentaire']??null,'statut'=>'brouillon']
                );
            }
        });

        return back()->with('success', 'Sauvegarde effectuée.');
    }

    public function soumettre(Dossier $dossier)
    {
        $expert = Expert::where('user_id', Auth::id())->firstOrFail();
        $this->autoriser($expert, $dossier);

        $dejaSoumis = EvaluationQuantitative::where('dossier_id',$dossier->id)
            ->where('expert_id',$expert->id)->where('statut','soumis')->exists();
        abort_if($dejaSoumis, 422, 'Déjà soumis.');

        $nbNotes = EvaluationQuantitative::where('dossier_id',$dossier->id)
            ->where('expert_id',$expert->id)->whereNotNull('note')->count();
        abort_if($nbNotes === 0, 422, 'Aucune note saisie.');

        DB::transaction(function () use ($dossier, $expert) {
            EvaluationQuantitative::where('dossier_id',$dossier->id)
                ->where('expert_id',$expert->id)->where('statut','brouillon')
                ->update(['statut'=>'soumis','soumis_le'=>now()]);

            $uids = DB::table('utilisateurs_dee')->pluck('user_id');
            $etab = DB::table('etablissements')->find($dossier->etablissement_id);
            foreach ($uids as $uid) {
                NotificationAneaq::envoyer($uid,'general',
                    "Évaluation soumise — {$etab->acronyme} {$etab->ville}",
                    "{$expert->prenom} {$expert->nom} a soumis son évaluation quantitative (Vague {$dossier->vague}).",
                    'dossier',$dossier->id);
            }
        });

        return redirect()->route('expert.dossiers.show', $dossier)
            ->with('success', 'Évaluation soumise. La DEE a été notifiée.');
    }

    private function autoriser(Expert $expert, Dossier $dossier): void
    {
        $ok = DB::table('expert_dossier')
            ->where('expert_id',$expert->id)->where('dossier_id',$dossier->id)
            ->where('statut_participation','confirme')->exists();
        abort_unless($ok, 403);
    }
}