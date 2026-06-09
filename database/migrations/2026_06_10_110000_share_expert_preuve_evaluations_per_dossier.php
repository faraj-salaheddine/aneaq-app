<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Supprimer les doublons (garder le plus récent par dossier+critere+preuve)
        DB::statement("
            DELETE e1
            FROM expert_preuve_evaluations e1
            INNER JOIN expert_preuve_evaluations e2
            ON  e1.dossier_id   = e2.dossier_id
            AND e1.critere_id   = e2.critere_id
            AND e1.preuve_index = e2.preuve_index
            AND e1.id < e2.id
        ");

        // Créer les index FK s'ils n'existent pas encore
        $existing = collect(DB::select("SHOW INDEX FROM expert_preuve_evaluations"))
            ->pluck('Key_name')->unique();

        if (!$existing->contains('epe_dossier_idx')) {
            DB::statement("ALTER TABLE expert_preuve_evaluations ADD INDEX epe_dossier_idx (dossier_id)");
        }
        if (!$existing->contains('epe_expert_idx')) {
            DB::statement("ALTER TABLE expert_preuve_evaluations ADD INDEX epe_expert_idx (expert_id)");
        }
        if (!$existing->contains('epe_critere_idx')) {
            DB::statement("ALTER TABLE expert_preuve_evaluations ADD INDEX epe_critere_idx (critere_id)");
        }

        // Supprimer l'ancienne contrainte unique composite
        if ($existing->contains('epe_unique')) {
            DB::statement("ALTER TABLE expert_preuve_evaluations DROP INDEX epe_unique");
        }

        // Ajouter la nouvelle contrainte partagée (sans expert_id)
        if (!$existing->contains('epe_dossier_unique')) {
            DB::statement("ALTER TABLE expert_preuve_evaluations ADD UNIQUE epe_dossier_unique (dossier_id, critere_id, preuve_index)");
        }

        // Supprimer l'index redondant sur dossier_id (couvert par epe_dossier_unique)
        $existing2 = collect(DB::select("SHOW INDEX FROM expert_preuve_evaluations"))
            ->pluck('Key_name')->unique();
        if ($existing2->contains('epe_dossier_idx')) {
            DB::statement("ALTER TABLE expert_preuve_evaluations DROP INDEX epe_dossier_idx");
        }
        // NB: epe_expert_idx et epe_critere_idx sont conservés (requis par les FK)
    }

    public function down(): void
    {
        $existing = collect(DB::select("SHOW INDEX FROM expert_preuve_evaluations"))
            ->pluck('Key_name')->unique();

        if (!$existing->contains('epe_expert_idx')) {
            DB::statement("ALTER TABLE expert_preuve_evaluations ADD INDEX epe_expert_idx (expert_id)");
        }
        if ($existing->contains('epe_dossier_unique')) {
            DB::statement("ALTER TABLE expert_preuve_evaluations DROP INDEX epe_dossier_unique");
        }
        if (!$existing->contains('epe_unique')) {
            DB::statement("ALTER TABLE expert_preuve_evaluations ADD UNIQUE epe_unique (dossier_id, expert_id, critere_id, preuve_index)");
        }
        if ($existing->contains('epe_expert_idx')) {
            DB::statement("ALTER TABLE expert_preuve_evaluations DROP INDEX epe_expert_idx");
        }
    }
};
