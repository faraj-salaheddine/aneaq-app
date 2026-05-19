<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('suivi_recommandations_log', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('recommandation_id');
            $table->enum('action', [
                'creation', 'soumission_dee', 'renvoi_expert', 'validation_dee',
                'envoi_etablissement', 'reponse_etablissement', 'renvoi_etablissement',
                'rappel_envoye', 'cloture',
            ]);
            $table->enum('acteur_type', ['expert', 'dee', 'etablissement', 'systeme']);
            $table->unsignedBigInteger('acteur_id')->nullable();
            $table->text('commentaire')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();
            $table->index(['recommandation_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('suivi_recommandations_log');
    }
};
