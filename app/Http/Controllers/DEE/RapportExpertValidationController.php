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
            ->update(['statut' => 'rapport_depose', 'updated_at' => now()]);

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
