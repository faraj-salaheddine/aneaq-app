<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Table pivot: expert_dossier
 * Gère l'affectation d'un expert à un dossier ainsi que son statut de participation.
 * Un expert peut être dans plusieurs dossiers, un dossier peut avoir plusieurs experts.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expert_dossier', function (Blueprint $table) {
            $table->id();

            $table->foreignId('expert_id')
                  ->constrained('experts')
                  ->onDelete('cascade');

            $table->foreignId('dossier_id')
                  ->constrained('dossiers')
                  ->onDelete('cascade');

            // Statut de participation de l'expert pour ce dossier
            $table->enum('statut_participation', [
                'invite',      // invitation envoyée, en attente de réponse
                'confirme',    // expert a confirmé sa participation
                'refuse',      // expert a refusé
            ])->default('invite');

            $table->timestamp('date_invitation')->nullable();
            $table->timestamp('date_reponse')->nullable();
            $table->text('motif_refus')->nullable();

            // Rôle dans le comité (coordonnateur ou membre)
            $table->enum('role_comite', ['coordonnateur', 'membre'])->default('membre');

            // Affecté par quel utilisateur DEE
            $table->foreignId('affecte_par')
                  ->nullable()
                  ->constrained('users')
                  ->onDelete('set null');

            $table->timestamps();

            // Un expert ne peut être affecté qu'une fois par dossier
            $table->unique(['expert_id', 'dossier_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expert_dossier');
    }
};