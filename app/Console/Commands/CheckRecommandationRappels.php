<?php

namespace App\Console\Commands;

use App\Models\Dossier;
use App\Models\NotificationAneaq;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CheckRecommandationRappels extends Command
{
    protected $signature = 'aneaq:check-recommandation-rappels';
    protected $description = 'Alerte la DEE quand 6 mois se sont écoulés depuis le dernier rappel de recommandations';

    public function handle(): void
    {
        $sixMonthsAgo = Carbon::now()->subMonths(6);

        // Dossiers ayant au moins une recommandation envoyée à l'établissement non clôturée
        $dossierIds = DB::table('recommandations_domaines')
            ->whereIn('statut', ['envoyee_etablissement', 'en_cours'])
            ->pluck('dossier_id')
            ->unique();

        $alertCount = 0;

        foreach ($dossierIds as $dossierId) {
            // Trouver le dernier rappel envoyé pour ce dossier
            $dernierRappel = DB::table('recommandation_rappels')
                ->where('dossier_id', $dossierId)
                ->latest('envoye_le')
                ->first();

            // Si pas de rappel, prendre la première date d'envoi à l'établissement
            if (!$dernierRappel) {
                $premiereDate = DB::table('recommandations_domaines')
                    ->where('dossier_id', $dossierId)
                    ->whereNotNull('date_envoi_etablissement')
                    ->min('date_envoi_etablissement');

                if (!$premiereDate || Carbon::parse($premiereDate)->gt($sixMonthsAgo)) {
                    continue;
                }
                $referenceDate = Carbon::parse($premiereDate);
            } else {
                $referenceDate = Carbon::parse($dernierRappel->envoye_le);
                if ($referenceDate->gt($sixMonthsAgo)) {
                    continue;
                }
            }

            // Vérifier si une alerte a déjà été envoyée pour cette période
            $alreadyNotified = DB::table('recommandation_rappels')
                ->where('dossier_id', $dossierId)
                ->where('type', 'alerte_dee')
                ->where('envoye_le', '>=', $referenceDate->toDateTimeString())
                ->exists();

            if ($alreadyNotified) {
                continue;
            }

            // Nombre de recommandations encore en cours
            $nbEnCours = DB::table('recommandations_domaines')
                ->where('dossier_id', $dossierId)
                ->whereIn('statut', ['envoyee_etablissement', 'en_cours'])
                ->count();

            $dossier = Dossier::find($dossierId);
            if (!$dossier) continue;

            $ref = $dossier->reference ?? "#{$dossierId}";

            // Notifier tous les DEE admins
            $deeUserIds = User::where('role', 'dee')->pluck('id');
            foreach ($deeUserIds as $userId) {
                NotificationAneaq::envoyer(
                    $userId,
                    'rappel',
                    "Rappel 6 mois — {$ref}",
                    "{$nbEnCours} recommandation(s) toujours en attente pour le dossier {$ref}. Vous pouvez envoyer un rappel à l'établissement.",
                    'Dossier',
                    $dossierId,
                );
            }

            // Marquer l'alerte comme envoyée
            DB::table('recommandation_rappels')->insert([
                'dossier_id'          => $dossierId,
                'type'                => 'alerte_dee',
                'message_personnalise' => null,
                'envoye_par_id'       => null,
                'envoye_le'           => now(),
            ]);

            $alertCount++;
            $this->line("Alerte envoyée pour dossier {$ref} ({$nbEnCours} recommandations en cours).");
        }

        $this->info("Terminé — {$alertCount} alerte(s) envoyée(s).");
    }
}
