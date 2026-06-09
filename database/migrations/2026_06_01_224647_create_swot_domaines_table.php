<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('swot_domaines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dossier_id')->constrained('dossiers')->cascadeOnDelete();
            $table->foreignId('expert_id')->constrained('experts')->cascadeOnDelete();
            $table->string('domaine', 5);       // 'A', 'B', 'C', ...
            $table->string('domaine_label')->nullable();
            $table->text('forces')->nullable();
            $table->text('faiblesses')->nullable();
            $table->text('opportunites')->nullable();
            $table->text('menaces')->nullable();
            // brouillon | soumis
            $table->string('statut', 20)->default('brouillon');
            $table->timestamps();

            $table->unique(['dossier_id', 'expert_id', 'domaine']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('swot_domaines');
    }
};
