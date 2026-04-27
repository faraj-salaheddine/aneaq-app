<?php

namespace App\Http\Controllers\Expert;

use App\Http\Controllers\Controller;
use App\Models\Expert;
use App\Models\Dossier;
use App\Models\NotificationAneaq;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ParticipationController extends Controller
{
    public function index(): Response
    {
        $expert = Expert::where('user_id', Auth::id())->firstOrFail();

        $invitations = DB::table('expert_dossier')
            ->where('expert_dossier.expert_id', $expert->id)
            ->join('dossiers', 'dossiers.id', '=', 'expert_dossier.dossier_id')
            ->join('etablissements', 'etablissements.id', '=', 'dossiers.etablissement_id')
            ->select(
                'dossiers.id as dossier_id',
                'dossiers.vague',
                'dossiers.statut as dossier_statut',
                'etablissements.acronyme',
                'etablissements.etablissement_2 as nom',
                'etablissements.ville',
                'etablissements.universite',
                'etablissements.domaine_connaissances',
                'expert_dossier.statut_participation',
                'expert_dossier.date_invitation',
                'expert_dossier.date_reponse',
                'expert_dossier.motif_refus',
                'expert_dossier.role_comite'
            )
            ->orderByDesc('expert_dossier.date_invitation')
            ->get();

        return Inertia::render('Expert/Participations/Index', [
            'expert'      => $expert,
            'invitations' => $invitations,
        ]);
    }

    public function confirmer(Request $request, Dossier $dossier)
    {
        $expert = Expert::where('user_id', Auth::id())->firstOrFail();

        $pivot = DB::table('expert_dossier')
            ->where('expert_id', $expert->id)
            ->where('dossier_id', $dossier->id)
            ->first();

        abort_if(!$pivot, 404);
        abort_if($pivot->statut_participation !== 'invite', 403, 'Action non autorisée.');

        DB::table('expert_dossier')
            ->where('expert_id', $expert->id)
            ->where('dossier_id', $dossier->id)
            ->update(['statut_participation' => 'confirme', 'date_reponse' => now()]);

        // Notifier DEE
        $this->notifierDee($dossier, $expert, 'confirme');

        return redirect()->route('expert.participations.index')
            ->with('success', 'Participation confirmée avec succès.');
    }

    public function refuser(Request $request, Dossier $dossier)
    {
        $request->validate(['motif_refus' => 'nullable|string|max:1000']);

        $expert = Expert::where('user_id', Auth::id())->firstOrFail();

        $pivot = DB::table('expert_dossier')
            ->where('expert_id', $expert->id)
            ->where('dossier_id', $dossier->id)
            ->first();

        abort_if(!$pivot, 404);
        abort_if($pivot->statut_participation !== 'invite', 403);

        DB::table('expert_dossier')
            ->where('expert_id', $expert->id)
            ->where('dossier_id', $dossier->id)
            ->update([
                'statut_participation' => 'refuse',
                'date_reponse'         => now(),
                'motif_refus'          => $request->motif_refus,
            ]);

        $this->notifierDee($dossier, $expert, 'refuse');

        return redirect()->route('expert.participations.index')
            ->with('info', 'Refus enregistré.');
    }

    private function notifierDee(Dossier $dossier, Expert $expert, string $reponse): void
    {
        $userIds = DB::table('utilisateurs_dee')->pluck('user_id');
        $etab    = DB::table('etablissements')->find($dossier->etablissement_id);
        $verbe   = $reponse === 'confirme' ? 'confirmé' : 'refusé';

        foreach ($userIds as $uid) {
            NotificationAneaq::envoyer(
                $uid,
                'invitation_participation',
                "Expert {$verbe} — {$etab->acronyme} {$etab->ville}",
                "L'expert {$expert->prenom} {$expert->nom} a {$verbe} sa participation au dossier {$etab->etablissement_2} (Vague {$dossier->vague}).",
                'dossier',
                $dossier->id
            );
        }
    }
}