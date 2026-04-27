<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Table: evaluations_quantitatives
 * Stocke les notes saisies par un expert pour chaque critère d'un dossier donné.
 * Une ligne = un expert + un dossier + un critère → une note.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evaluations_quantitatives', function (Blueprint $table) {
            $table->id();

            $table->foreignId('dossier_id')
                  ->constrained('dossiers')
                  ->onDelete('cascade');

            $table->foreignId('expert_id')
                  ->constrained('experts')
                  ->onDelete('cascade');

            $table->foreignId('critere_id')
                  ->constrained('criteres_evaluation')
                  ->onDelete('cascade');

            // Note de 1 à 5 (nullable si non encore saisie)
            $table->unsignedTinyInteger('note')->nullable();

            $table->text('commentaire')->nullable();

            $table->enum('statut', [
                'brouillon',  // sauvegardé mais pas soumis
                'soumis',     // soumis à la DEE (verrouillé)
            ])->default('brouillon');

            $table->timestamp('soumis_le')->nullable();

            $table->timestamps();

            // Un expert ne peut saisir qu'une note par critère par dossier
            $table->unique(['dossier_id', 'expert_id', 'critere_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluations_quantitatives');
    }
};