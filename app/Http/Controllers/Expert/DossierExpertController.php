<?php

namespace App\Http\Controllers\Expert;

use App\Http\Controllers\Controller;
use App\Models\Expert;
use App\Models\Dossier;
use App\Models\CritereEvaluation;
use App\Models\EvaluationQuantitative;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DossierExpertController extends Controller
{
    public function index(): Response
    {
        $expert = Expert::where('user_id', Auth::id())->firstOrFail();

        $dossiers = DB::table('expert_dossier')
            ->where('expert_dossier.expert_id', $expert->id)
            ->where('expert_dossier.statut_participation', 'confirme')
            ->join('dossiers', 'dossiers.id', '=', 'expert_dossier.dossier_id')
            ->join('etablissements', 'etablissements.id', '=', 'dossiers.etablissement_id')
            ->select(
                'dossiers.id',
                'dossiers.vague',
                'dossiers.statut',
                'dossiers.date_visite',
                'dossiers.observations',
                'etablissements.acronyme',
                'etablissements.etablissement_2 as nom',
                'etablissements.ville',
                'etablissements.universite',
                'etablissements.domaine_connaissances',
                'expert_dossier.role_comite'
            )
            ->orderByDesc('dossiers.updated_at')
            ->get();

        return Inertia::render('Expert/Dossiers/Index', [
            'expert'   => $expert,
            'dossiers' => $dossiers,
        ]);
    }

    public function show(Dossier $dossier): Response
    {
        $expert = Expert::where('user_id', Auth::id())->firstOrFail();
        $this->autoriser($expert, $dossier);

        $dossier->load('etablissement');

        $comite = DB::table('expert_dossier')
            ->where('dossier_id', $dossier->id)
            ->where('statut_participation', 'confirme')
            ->join('experts', 'experts.id', '=', 'expert_dossier.expert_id')
            ->select(
                'experts.nom',
                'experts.prenom',
                'experts.grade',
                'experts.specialite',
                'expert_dossier.role_comite'
            )
            ->get();

        $totalCriteres  = CritereEvaluation::whereNotNull('parent_id')->count();
        $criteresSaisis = EvaluationQuantitative::where('dossier_id', $dossier->id)
            ->where('expert_id', $expert->id)
            ->whereNotNull('note')
            ->count();

        $rapport = DB::table('rapports_experts')
            ->where('dossier_id', $dossier->id)
            ->where('expert_id', $expert->id)
            ->first();

        $nbRecommandations = DB::table('matrices_recommandations')
            ->where('dossier_id', $dossier->id)
            ->where('expert_id', $expert->id)
            ->count();

        return Inertia::render('Expert/Dossiers/Show', [
            'expert'            => $expert,
            'dossier'           => $dossier,
            'comite'            => $comite,
            'progression'       => $totalCriteres > 0
                                    ? round(($criteresSaisis / $totalCriteres) * 100)
                                    : 0,
            'rapport'           => $rapport,
            'nbRecommandations' => $nbRecommandations,
        ]);
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