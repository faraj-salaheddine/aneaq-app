<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('critere_preuves', function (Blueprint $table) {
            $table->id();

            $table->foreignId('critere_id')
                  ->constrained('criteres')
                  ->onDelete('cascade');

            $table->foreignId('etablissement_id')
                  ->constrained('etablissements')
                  ->onDelete('cascade');

            $table->unsignedTinyInteger('preuve_index');

            $table->boolean('existe')->default(true);
            $table->string('fichier_path')->nullable();
            $table->string('fichier_nom')->nullable();
            $table->text('commentaire')->nullable();

            $table->timestamps();

            $table->unique(['critere_id', 'etablissement_id', 'preuve_index']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('critere_preuves');
    }
};