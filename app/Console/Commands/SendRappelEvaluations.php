<?php

namespace App\Console\Commands;

use App\Models\NotificationAneaq;
use App\Services\ActivityLogger;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;

class SendRappelEvaluations extends Command
{
    protected $signature   = 'rappels:evaluations';
    protected $description = "Envoie des rappels aux experts dont l'évaluation quantitative est incomplète";

    public function handle(): void
    {
        if (!Schema::hasTable('dossier_experts') || !Schema::hasTable('criteres_evaluation')) {
            $this->info('Tables manquantes — rappels ignorés.');
            return;
        }

        $totalCriteres = DB::table('criteres_evaluation')->whereNotNull('parent_id')->count();
        if ($totalCriteres === 0) {
            $this->info('Aucun critère — rappels ignorés.');
            return;
        }

        // Experts confirmés avec évaluation incomplète (< 100%)
        $affectations = DB::table('dossier_experts as de')
            ->join('experts as e', 'e.id', '=', 'de.expert_id')
            ->join('dossiers as d', 'd.id', '=', 'de.dossier_id')
            ->whereIn('de.status', ['confirme_par_expert', 'comite_confirme'])
            ->whereNotIn('d.statut', ['valide', 'cloture', 'rejete'])
            ->select('e.id as expert_id', 'e.email', 'e.prenom', 'e.nom', 'e.user_id', 'd.reference', 'd.id as dossier_id')
            ->get();

        $count = 0;

        foreach ($affectations as $a) {
            $remplis = DB::table('evaluations_quantitatives')
                ->where('expert_id', $a->expert_id)
                ->where('dossier_id', $a->dossier_id)
                ->whereNotNull('note')
                ->count();

            // Ne rappeler que si moins de 50% rempli
            if ($remplis >= ($totalCriteres * 0.5)) continue;

            $pct = round(($remplis / $totalCriteres) * 100);

            if ($a->user_id) {
                NotificationAneaq::create([
                    'user_id' => $a->user_id,
                    'type'    => 'rappel_evaluation',
                    'titre'   => 'Évaluation incomplète',
                    'message' => "Votre évaluation du dossier {$a->reference} est à {$pct}%. Merci de la compléter.",
                    'lu'      => false,
                ]);
            }

            if (!empty($a->email)) {
                try {
                    Mail::raw(
                        "Bonjour {$a->prenom} {$a->nom},\n\n" .
                        "Votre évaluation quantitative du dossier {$a->reference} n'est complète qu'à {$pct}%.\n\n" .
                        "Merci de vous connecter à la plateforme ANEAQ pour finaliser votre évaluation.\n\n" .
                        "Cordialement,\nL'équipe ANEAQ",
                        fn ($m) => $m->to($a->email)
                            ->subject("[ANEAQ] Rappel — Évaluation incomplète : {$a->reference} ({$pct}%)")
                    );
                } catch (\Throwable $e) {
                    Log::warning("Rappel éval non envoyé à {$a->email} : " . $e->getMessage());
                }
            }

            $count++;
        }

        ActivityLogger::log('rappels_evaluations_envoyes', "{$count} rappel(s) évaluation envoyé(s)");
        $this->info("{$count} rappel(s) envoyé(s).");
    }
}
