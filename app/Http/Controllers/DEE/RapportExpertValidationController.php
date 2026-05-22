<?php

namespace App\Http\Controllers\DEE;

use App\Http\Controllers\Controller;
use App\Models\Dossier;
use App\Models\Expert;
use App\Models\NotificationAneaq;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class RapportExpertValidationController extends Controller
{
    public function valider(Request $request, Dossier $dossier, $rapport)
    {
        $row = DB::table('rapports_experts')
            ->where('id', $rapport)
            ->where('dossier_id', $dossier->id)
            ->first();

        abort_if(!$row, 404);

        DB::table('rapports_experts')->where('id', $rapport)->update([
            'statut'     => 'valide',
            'motif_rejet' => null,
            'valide_le'  => now(),
            'valide_par' => Auth::id(),
            'updated_at' => now(),
        ]);

        DB::table('dossiers')
            ->where('id', $dossier->id)
            ->update(['statut' => 'valide', 'updated_at' => now()]);

        $this->notifyExpert($row->expert_id, $dossier, 'accepte');

        return back()->with('success', 'Rapport expert validé avec succès.');
    }

    public function rejeter(Request $request, Dossier $dossier, $rapport)
    {
        $request->validate([
            'motif' => ['required', 'string', 'max:1000'],
        ], [
            'motif.required' => 'Le motif de refus est obligatoire.',
        ]);

        $row = DB::table('rapports_experts')
            ->where('id', $rapport)
            ->where('dossier_id', $dossier->id)
            ->first();

        abort_if(!$row, 404);

        DB::table('rapports_experts')->where('id', $rapport)->update([
            'statut'      => 'rejete',
            'motif_rejet' => $request->input('motif'),
            'valide_le'   => null,
            'valide_par'  => Auth::id(),
            'updated_at'  => now(),
        ]);

        $this->notifyExpert($row->expert_id, $dossier, 'rejete', $request->input('motif'));

        return back()->with('success', 'Rapport expert refusé.');
    }

    public function cloturer(Dossier $dossier)
    {
        abort_unless($dossier->statut === 'valide', 422, 'Le dossier doit être validé avant d\'être clôturé.');

        DB::table('dossiers')
            ->where('id', $dossier->id)
            ->update(['cloture_at' => now(), 'updated_at' => now()]);

        // Notify établissement user
        $etab = DB::table('etablissements')->where('id', $dossier->etablissement_id)->first();
        if ($etab && !empty($etab->user_id)) {
            try {
                NotificationAneaq::envoyer(
                    $etab->user_id, 'general',
                    'Dossier clôturé',
                    "Votre dossier {$dossier->reference} a été clôturé par la DEE. Il est désormais archivé.",
                    'Dossier', $dossier->id
                );
            } catch (\Throwable) {}
        }

        // Notify assigned experts
        if (Schema::hasTable('dossier_experts') && Schema::hasTable('experts')) {
            $expertIds = DB::table('dossier_experts')
                ->where('dossier_id', $dossier->id)
                ->pluck('expert_id');

            foreach ($expertIds as $eid) {
                $expert = DB::table('experts')->where('id', $eid)->first();
                if ($expert && !empty($expert->user_id)) {
                    try {
                        NotificationAneaq::envoyer(
                            $expert->user_id, 'general',
                            'Dossier clôturé',
                            "Le dossier {$dossier->reference} a été clôturé. Il est désormais archivé dans votre historique.",
                            'Dossier', $dossier->id
                        );
                    } catch (\Throwable) {}
                }
            }
        }

        return back()->with('success', 'Dossier clôturé avec succès. Il est désormais archivé.');
    }

    private function notifyExpert(int $expertId, Dossier $dossier, string $action, ?string $motif = null): void
    {
        if (!Schema::hasTable('experts') || !Schema::hasColumn('experts', 'user_id')) {
            return;
        }

        $expert = DB::table('experts')->where('id', $expertId)->first();

        if (!$expert || empty($expert->user_id)) {
            return;
        }

        if ($action === 'accepte') {
            $titre   = 'Rapport validé';
            $message = "Votre rapport pour le dossier {$dossier->reference} a été accepté par la DEE.";
        } else {
            $titre   = 'Rapport refusé';
            $message = "Votre rapport pour le dossier {$dossier->reference} a été refusé. Motif : {$motif}";
        }

        $type = $action === 'accepte' ? 'rapport_valide' : 'rapport_rejete';

        try {
            NotificationAneaq::envoyer(
                $expert->user_id,
                $type,
                $titre,
                $message,
                'Dossier',
                $dossier->id
            );
        } catch (\Throwable) {
            // Notification failure must not block validation
        }
    }
}
