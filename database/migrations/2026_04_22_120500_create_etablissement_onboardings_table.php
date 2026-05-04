<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('etablissement_onboardings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('etablissement_id')->constrained('etablissements')->cascadeOnDelete();
            $table->foreignId('dossier_id')->nullable()->constrained('dossiers')->nullOnDelete();
            $table->text('adresse')->nullable();
            $table->string('site_web')->nullable();
            $table->string('telephone')->nullable();
            $table->string('responsable_nom')->nullable();
            $table->string('responsable_fonction')->nullable();
            $table->string('responsable_email')->nullable();
            $table->string('responsable_telephone')->nullable();
            $table->string('statut')->default('brouillon');
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->unique('etablissement_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('etablissement_onboardings');
    }
};
