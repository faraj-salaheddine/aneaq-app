<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dossier_experts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dossier_id')->constrained('dossiers')->cascadeOnDelete();
            $table->foreignId('expert_id')->constrained('experts')->cascadeOnDelete();
            $table->string('role')->nullable();
            $table->string('statut_participation')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('validated_by_dee_at')->nullable();
            $table->timestamps();
            $table->unique(['dossier_id', 'expert_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dossier_experts');
    }
};
