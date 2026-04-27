<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Table: dossiers
 * Un dossier représente un établissement soumis à évaluation dans une vague donnée.
 * Plusieurs experts peuvent être affectés à un même dossier (via expert_dossier).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dossiers', function (Blueprint $table) {
            $table->id();

            $table->foreignId('etablissement_id')
                  ->constrained('etablissements')
                  ->onDelete('cascade');

            // Vague d'évaluation ex: "2026-A", "2026-B"
            $table->string('vague', 20);

            $table->enum('statut', [
                'en_preparation',   // dossier créé, pas encore envoyé
                'autoeval_en_cours',// établissement rédige son rapport
                'autoeval_depose',  // rapport d'autoévaluation déposé
                'en_evaluation',    // experts affectés, évaluation quantitative en cours
                'visite_planifiee', // visite sur site programmée
                'rapport_en_attente', // visite faite, rapport expert à déposer
                'rapport_depose',   // rapport expert déposé
                'valide',           // validé par DEE
                'transfere',        // transmis à l'établissement
                'cloture',          // processus terminé
            ])->default('en_preparation');

            $table->date('date_visite')->nullable();
            $table->text('observations')->nullable();

            // Créé par un utilisateur DEE
            $table->foreignId('created_by')
                  ->nullable()
                  ->constrained('users')
                  ->onDelete('set null');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dossiers');
    }
};