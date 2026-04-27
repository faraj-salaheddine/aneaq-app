<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Table: notifications_aneaq
 * Historique de toutes les notifications émises aux utilisateurs.
 * Couvre: affectation, invitation, validation rapport, visite, etc.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications_aneaq', function (Blueprint $table) {
            $table->id();

            // Destinataire
            $table->foreignId('user_id')
                  ->constrained('users')
                  ->onDelete('cascade');

            $table->enum('type', [
                'invitation_participation',
                'affectation_dossier',
                'rappel_evaluation',
                'rappel_rapport',
                'visite_programmee',
                'rapport_valide',
                'rapport_rejete',
                'general',
            ]);

            $table->string('titre');
            $table->text('message');

            // Lien optionnel vers une entité (ex: dossier_id, rapport_id)
            $table->string('entite_type')->nullable(); // ex: "dossier", "rapport"
            $table->unsignedBigInteger('entite_id')->nullable();

            $table->boolean('lu')->default(false);
            $table->timestamp('lu_le')->nullable();

            $table->timestamps();

            $table->index(['user_id', 'lu']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications_aneaq');
    }
};