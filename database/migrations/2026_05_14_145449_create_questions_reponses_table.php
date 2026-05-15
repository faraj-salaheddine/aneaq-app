<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('questions_reponses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('dossier_id')->constrained('dossiers')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->text('question');
            $table->text('reponse')->nullable();
            $table->foreignId('repondu_par')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('repondu_le')->nullable();
            $table->enum('statut', ['en_attente', 'repondu'])->default('en_attente');
            $table->timestamps();
            $table->index(['dossier_id', 'statut']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('questions_reponses');
    }
};
