<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('campagne_etablissements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('campagne_evaluation_id')->constrained('campagne_evaluations')->cascadeOnDelete();
            $table->foreignId('etablissement_id')->constrained('etablissements')->cascadeOnDelete();
            $table->string('statut')->default('sélectionné');
            $table->text('observation')->nullable();
            $table->timestamp('lettre_envoyee_at')->nullable();
            $table->timestamp('email_envoye_at')->nullable();
            $table->timestamp('compte_genere_at')->nullable();
            $table->unsignedBigInteger('dossier_id')->nullable();
            $table->foreignId('selected_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->unique(['campagne_evaluation_id', 'etablissement_id'], 'campagne_etablissement_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('campagne_etablissements');
    }
};
