<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('criteres', function (Blueprint $table) {
            $table->id();

            // Hiérarchie du référentiel ANEAQ
            $table->string('domaine');        // ex: "A", "B", "C"
            $table->string('domaine_label');  // ex: "Gouvernance et management..."
            $table->string('champ');          // ex: "A.I", "A.II"
            $table->string('champ_label');    // ex: "Gouvernance de l'institution"
            $table->string('reference');      // ex: "A I.1", "A I.2"
            $table->text('reference_label'); // ex: "L'accomplissement par l'institution..."
            $table->unsignedTinyInteger('critere_num'); // 1, 2, 3...
            $table->text('critere_label');   // texte du critère

            // Preuves stockées en JSON (liste ordonnée)
            $table->json('preuves');         // ["Chartes de valeurs élaborées...", "Chartes diffusées...", ...]

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('criteres');
    }
};