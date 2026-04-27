<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Table: criteres_evaluation
 * Référentiel des critères et axes d'évaluation.
 * Structuré en axes → critères (parent/enfant via parent_id).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('criteres_evaluation', function (Blueprint $table) {
            $table->id();

            // Null = c'est un AXE ; non-null = c'est un critère fils d'un axe
            $table->foreignId('parent_id')
                  ->nullable()
                  ->constrained('criteres_evaluation')
                  ->onDelete('cascade');

            $table->string('code', 20);       // ex: "C1", "C1.1", "C2.3"
            $table->string('libelle');         // ex: "Gouvernance et Pilotage"
            $table->decimal('poids', 5, 2)->default(0); // poids en % (ex: 25.00)
            $table->integer('ordre')->default(0);       // ordre d'affichage

            $table->timestamps();

            $table->unique('code');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('criteres_evaluation');
    }
};