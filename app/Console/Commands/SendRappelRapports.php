<?php

namespace App\Console\Commands;

use App\Models\NotificationAneaq;
use App\Services\ActivityLogger;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;

class SendRappelRapports extends Command
{
    protected $signature   = 'rappels:rapports';
    protected $description = 'Envoie des rappels aux experts dont le rapport est en retard ou manquant';

    public function handle(): void
    {
        if (!Schema::hasTable('dossier_experts') || !Schema::hasTable('experts')) {
            $this->info('Tables manquantes — rappels ignorés.');
            return;
        }

        // Experts confirmés sur des dossiers actifs sans rapport déposé
        $affectations = DB::table('dossier_experts as de')
            ->join('experts as e', 'e.id', '=', 'de.expert_id')
            ->join('dossiers as d', 'd.id', '=', 'de.dossier_id')
            ->leftJoin('rapports_experts as r', function ($j) {
                $j->on('r.expert_id', '=', 'de.expert_id')
                  ->on('r.dossier_id', '=', 'de.dossier_id');
            })
            ->whereIn('de.status', ['confirme_par_expert', 'comite_confirme'])
            ->whereNull('r.id')
            ->whereNotIn('d.statut', ['valide', 'cloture', 'rejete'])
            ->select('e.id as expert_id', 'e.email', 'e.prenom', 'e.nom', 'e.user_id', 'd.reference', 'd.id as dossier_id')
            ->get();

        $count = 0;

        foreach ($affectations as $a) {
            if (empty($a->email)) continue;

            if ($a->user_id) {
                NotificationAneaq::create([
                    'user_id' => $a->user_id,
                    'type'    => 'rappel_rapport',
                    'titre'   => 'Rapport manquant',
                    'message' => "Votre rapport pour le dossier {$a->reference} n'a pas encore été déposé.",
                    'lu'      => false,
                ]);
            }

            try {
                Mail::raw(
                    "Bonjour {$a->prenom} {$a->nom},\n\n" .
                    "Ce message est un rappel automatique : votre rapport d'évaluation pour le dossier {$a->reference} n'a pas encore été déposé sur la plateforme ANEAQ.\n\n" .
                    "Merci de vous connecter dès que possible pour soumettre votre rapport.\n\n" .
                    "Cordialement,\nL'équipe ANEAQ",
                    fn ($m) => $m->to($a->email)
                        ->subject("[ANEAQ] Rappel — Rapport en attente : {$a->reference}")
                );
            } catch (\Throwable $e) {
                Log::warning("Rappel rapport non envoyé à {$a->email} : " . $e->getMessage());
            }

            $count++;
        }

        ActivityLogger::log('rappels_rapports_envoyes', "{$count} rappel(s) rapport envoyé(s)");
        $this->info("{$count} rappel(s) envoyé(s).");
    }
}
