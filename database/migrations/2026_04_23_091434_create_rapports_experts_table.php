<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Table: rapports_experts
 * Stocke les rapports finaux déposés par les experts pour chaque dossier.
 * Un expert peut déposer un seul rapport final par dossier.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rapports_experts', function (Blueprint $table) {
            $table->id();

            $table->foreignId('dossier_id')
                  ->constrained('dossiers')
                  ->onDelete('cascade');

            $table->foreignId('expert_id')
                  ->constrained('experts')
                  ->onDelete('cascade');

            // Chemin du fichier stocké sur le serveur
            $table->string('file_path');
            $table->string('original_name');
            $table->string('mime_type', 100); // application/pdf ou application/vnd.openxmlformats...
            $table->unsignedBigInteger('file_size'); // en octets

            $table->enum('statut', [
                'depose',    // déposé par l'expert, en attente DEE
                'valide',    // validé par DEE
                'rejete',    // rejeté par DEE avec motif
            ])->default('depose');

            $table->text('motif_rejet')->nullable();
            $table->timestamp('valide_le')->nullable();

            $table->foreignId('valide_par')
                  ->nullable()
                  ->constrained('users')
                  ->onDelete('set null');

            $table->timestamps();

            // Un seul rapport final par expert par dossier
            $table->unique(['dossier_id', 'expert_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rapports_experts');
    }
};