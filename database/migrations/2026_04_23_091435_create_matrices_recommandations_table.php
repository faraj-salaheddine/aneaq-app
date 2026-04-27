<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Table: matrices_recommandations
 * Chaque ligne correspond à une recommandation formulée par un expert
 * pour un critère précis dans un dossier donné.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('matrices_recommandations', function (Blueprint $table) {
            $table->id();

            $table->foreignId('dossier_id')
                  ->constrained('dossiers')
                  ->onDelete('cascade');

            $table->foreignId('expert_id')
                  ->constrained('experts')
                  ->onDelete('cascade');

            $table->foreignId('critere_id')
                  ->nullable()
                  ->constrained('criteres_evaluation')
                  ->onDelete('set null');

            $table->text('constat')->nullable();
            $table->text('point_fort')->nullable();
            $table->text('point_faible')->nullable();
            $table->text('recommandation')->nullable();

            $table->enum('priorite', ['haute', 'moyenne', 'basse'])->default('moyenne');

            $table->enum('statut', [
                'brouillon',
                'soumis',
            ])->default('brouillon');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('matrices_recommandations');
    }
};