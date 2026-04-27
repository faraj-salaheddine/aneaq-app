<?php

namespace App\Http\Controllers\Expert;

use App\Http\Controllers\Controller;
use App\Models\Expert;
use App\Models\NotificationAneaq;
use App\Models\EvaluationQuantitative;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ExpertDashboardController extends Controller
{
    public function index(): Response
    {
        $expert = Expert::where('user_id', Auth::id())->firstOrFail();

        $dossiersActifs = DB::table('expert_dossier')
            ->where('expert_id', $expert->id)
            ->where('statut_participation', 'confirme')
            ->join('dossiers', 'dossiers.id', '=', 'expert_dossier.dossier_id')
            ->whereNotIn('dossiers.statut', ['cloture', 'valide', 'transfere'])
            ->count();

        $invitationsEnAttente = DB::table('expert_dossier')
            ->where('expert_id', $expert->id)
            ->where('statut_participation', 'invite')
            ->count();

        $evaluationsEnCours = EvaluationQuantitative::where('expert_id', $expert->id)
            ->where('statut', 'brouillon')
            ->distinct('dossier_id')->count('dossier_id');

        $rapportsADeposer = DB::table('expert_dossier')
            ->where('expert_id', $expert->id)
            ->where('statut_participation', 'confirme')
            ->join('dossiers', 'dossiers.id', '=', 'expert_dossier.dossier_id')
            ->whereIn('dossiers.statut', ['visite_planifiee', 'rapport_en_attente'])
            ->whereNotExists(fn($q) => $q->from('rapports_experts')
                ->whereColumn('rapports_experts.dossier_id', 'dossiers.id')
                ->where('rapports_experts.expert_id', $expert->id))
            ->count();

        $dossiers = DB::table('expert_dossier')
            ->where('expert_dossier.expert_id', $expert->id)
            ->where('expert_dossier.statut_participation', 'confirme')
            ->join('dossiers', 'dossiers.id', '=', 'expert_dossier.dossier_id')
            ->join('etablissements', 'etablissements.id', '=', 'dossiers.etablissement_id')
            ->whereNotIn('dossiers.statut', ['cloture'])
            ->select('dossiers.id','dossiers.vague','dossiers.statut','dossiers.date_visite',
                'etablissements.acronyme','etablissements.etablissement_2 as nom',
                'etablissements.ville','etablissements.universite',
                'etablissements.domaine_connaissances','expert_dossier.role_comite')
            ->orderByDesc('dossiers.updated_at')->take(5)->get();

        $notifications = NotificationAneaq::where('user_id', Auth::id())
            ->latest()->take(5)->get();

        $notificationsNonLues = NotificationAneaq::where('user_id', Auth::id())
            ->where('lu', false)->count();

        return Inertia::render('Expert/Dashboard', [
            'expert'               => $expert,
            'stats'                => compact('dossiersActifs','invitationsEnAttente','evaluationsEnCours','rapportsADeposer'),
            'dossiers'             => $dossiers,
            'notifications'        => $notifications,
            'notificationsNonLues' => $notificationsNonLues,
        ]);
    }
}