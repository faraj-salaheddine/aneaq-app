<?php

namespace App\Console\Commands;

use App\Models\NotificationAneaq;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class BackfillExpertNotifications extends Command
{
    protected $signature   = 'aneaq:backfill-expert-notifications';
    protected $description = 'Crée les notifications manquantes pour les affectations experts existantes';

    public function handle(): int
    {
        $assignments = DB::table('dossier_experts')
            ->join('experts', 'dossier_experts.expert_id', '=', 'experts.id')
            ->join('dossiers', 'dossier_experts.dossier_id', '=', 'dossiers.id')
            ->select(
                'dossier_experts.id as de_id',
                'dossier_experts.status',
                'dossier_experts.role_expert',
                'dossier_experts.created_at as affecte_at',
                'dossier_experts.access_sent_at',
                'experts.user_id',
                'experts.email as expert_email',
                'dossiers.reference',
                'dossiers.id as dossier_id',
            )
            ->whereNotNull('experts.user_id')
            ->get();

        $created = 0;

        foreach ($assignments as $a) {
            $userId = $a->user_id;
            if (!$userId) continue;

            $ref = $a->reference ?? '—';
            $notifications = $this->buildNotifications($a, $ref);

            foreach ($notifications as $notif) {
                $exists = NotificationAneaq::where('user_id', $userId)
                    ->where('titre', $notif['titre'])
                    ->exists();

                if ($exists) continue;

                NotificationAneaq::create([
                    'user_id'     => $userId,
                    'type'        => $notif['type'],
                    'titre'       => $notif['titre'],
                    'message'     => $notif['message'],
                    'entite_type' => 'Dossier',
                    'entite_id'   => $a->dossier_id,
                    'lu'          => $notif['lu'],
                    'created_at'  => $notif['created_at'],
                    'updated_at'  => $notif['created_at'],
                ]);
                $created++;
            }
        }

        $this->info("{$created} notification(s) cree(s).");
        return 0;
    }

    private function buildNotifications(object $a, string $ref): array
    {
        $role = $a->role_expert === 'chef_comite' ? 'Coordonnateur expert' : 'Expert';
        $notifs = [];

        $notifs[] = [
            'type'       => 'affectation_dossier',
            'titre'      => "Proposition d'affectation -- {$ref}",
            'message'    => "Vous avez ete propose comme {$role} pour le dossier {$ref}. En attente de confirmation DEE.",
            'lu'         => true,
            'created_at' => $a->affecte_at ?? now(),
        ];

        if ($a->access_sent_at) {
            $notifs[] = [
                'type'       => 'affectation_dossier',
                'titre'      => "Invitation a confirmer -- {$ref}",
                'message'    => "La DEE vous a confirme comme {$role} pour le dossier {$ref}. Veuillez confirmer votre participation.",
                'lu'         => true,
                'created_at' => $a->access_sent_at,
            ];
        }

        if (in_array($a->status, ['accepte_par_expert', 'confirme_par_expert', 'comite_confirme'])) {
            $notifs[] = [
                'type'       => 'general',
                'titre'      => "Invitation acceptee -- {$ref}",
                'message'    => "Vous avez accepte votre participation pour le dossier {$ref}.",
                'lu'         => true,
                'created_at' => $a->access_sent_at ?? $a->affecte_at ?? now(),
            ];
        }

        if (in_array($a->status, ['confirme_par_expert', 'comite_confirme'])) {
            $notifs[] = [
                'type'       => 'affectation_dossier',
                'titre'      => "Affectation confirmee -- {$ref}",
                'message'    => "Votre participation pour le dossier {$ref} en tant que {$role} est officiellement confirmee.",
                'lu'         => true,
                'created_at' => $a->access_sent_at ?? $a->affecte_at ?? now(),
            ];
        }

        if ($a->status === 'refuse_par_expert') {
            $notifs[] = [
                'type'       => 'general',
                'titre'      => "Invitation refusee -- {$ref}",
                'message'    => "Vous avez refuse votre participation pour le dossier {$ref}.",
                'lu'         => true,
                'created_at' => $a->access_sent_at ?? $a->affecte_at ?? now(),
            ];
        }

        return $notifs;
    }
}
