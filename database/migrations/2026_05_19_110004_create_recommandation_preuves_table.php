<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recommandation_preuves', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('recommandation_id');
            $table->string('fichier_path');
            $table->string('fichier_nom');
            $table->string('fichier_type', 20)->nullable();
            $table->unsignedBigInteger('fichier_taille')->nullable();
            $table->text('description')->nullable();
            $table->unsignedBigInteger('uploaded_by');
            $table->timestamps();
            $table->index('recommandation_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recommandation_preuves');
    }
};
