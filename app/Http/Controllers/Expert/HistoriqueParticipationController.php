<?php

namespace App\Http\Controllers\Expert;

use App\Http\Controllers\Controller;
use App\Models\Expert;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class HistoriqueParticipationController extends Controller
{
    public function index(): Response
    {
        $expert = Expert::where('user_id', Auth::id())->firstOrFail();

        $participations = DB::table('expert_dossier')
            ->where('expert_dossier.expert_id', $expert->id)
            ->join('dossiers', 'dossiers.id', '=', 'expert_dossier.dossier_id')
            ->join('etablissements', 'etablissements.id', '=', 'dossiers.etablissement_id')
            ->leftJoin('rapports_experts', function ($j) use ($expert) {
                $j->on('rapports_experts.dossier_id', '=', 'dossiers.id')
                  ->where('rapports_experts.expert_id', $expert->id);
            })
            ->select(
                'dossiers.id',
                'dossiers.vague',
                'dossiers.statut',
                'etablissements.acronyme',
                'etablissements.etablissement_2 as nom',
                'etablissements.ville',
                'etablissements.universite',
                'etablissements.domaine_connaissances',
                'expert_dossier.statut_participation',
                'expert_dossier.role_comite',
                'expert_dossier.date_invitation',
                'expert_dossier.date_reponse',
                'rapports_experts.id as rapport_id',
                'rapports_experts.statut as rapport_statut',
                'rapports_experts.original_name as rapport_nom'
            )
            ->orderByDesc('expert_dossier.created_at')
            ->get();

        return Inertia::render('Expert/Historique/Index', [
            'expert'         => $expert,
            'participations' => $participations,
        ]);
    }
}