<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('expert_preuve_evaluations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dossier_id')->constrained('dossiers')->cascadeOnDelete();
            $table->foreignId('expert_id')->constrained('experts')->cascadeOnDelete();
            $table->foreignId('critere_id')->constrained('criteres')->cascadeOnDelete();
            $table->unsignedTinyInteger('preuve_index');
            // 0=absent  1=non-conforme  2=acceptable  3=conforme
            $table->tinyInteger('note')->nullable();
            $table->text('observation')->nullable();
            // brouillon | soumis
            $table->string('statut', 20)->default('brouillon');
            $table->timestamp('soumis_le')->nullable();
            $table->timestamps();

            $table->unique(['dossier_id', 'expert_id', 'critere_id', 'preuve_index'], 'epe_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('expert_preuve_evaluations');
    }
};
