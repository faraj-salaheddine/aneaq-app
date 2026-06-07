<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Confirmation de visite côté établissement (sur la table dossiers)
        Schema::table('dossiers', function (Blueprint $table) {
            $table->string('visite_statut_etab')->nullable()->after('date_visite'); // en_attente|accepte|refuse
            $table->text('visite_message_etab')->nullable()->after('visite_statut_etab');
        });

        // Confirmation de visite côté expert (sur dossier_experts)
        Schema::table('dossier_experts', function (Blueprint $table) {
            $table->string('visite_statut')->nullable()->after('expert_confirmed_at'); // en_attente|accepte|refuse
            $table->text('visite_message')->nullable()->after('visite_statut');
        });
    }

    public function down(): void
    {
        Schema::table('dossiers', function (Blueprint $table) {
            $table->dropColumn(['visite_statut_etab', 'visite_message_etab']);
        });

        Schema::table('dossier_experts', function (Blueprint $table) {
            $table->dropColumn(['visite_statut', 'visite_message']);
        });
    }
};
