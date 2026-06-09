<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE notifications_aneaq MODIFY COLUMN `type` ENUM(
            'invitation_participation',
            'affectation_dossier',
            'rappel_evaluation',
            'rappel_rapport',
            'visite_programmee',
            'rapport_valide',
            'rapport_rejete',
            'rapport_envoye',
            'general',
            'info',
            'document',
            'annexe',
            'visite',
            'reponse',
            'question',
            'evaluation_annexe'
        ) NOT NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE notifications_aneaq MODIFY COLUMN `type` ENUM(
            'invitation_participation',
            'affectation_dossier',
            'rappel_evaluation',
            'rappel_rapport',
            'visite_programmee',
            'rapport_valide',
            'rapport_rejete',
            'general',
            'info',
            'document',
            'annexe',
            'visite',
            'reponse',
            'question',
            'evaluation_annexe'
        ) NOT NULL");
    }
};
