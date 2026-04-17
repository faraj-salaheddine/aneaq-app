<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('etablissements', function (Blueprint $table) {
            $table->id();

            $table->string('acronyme')->nullable();
            $table->string('domaine_connaissances')->nullable();
            $table->string('evaluation')->nullable();
            $table->string('etablissement')->nullable();
            $table->string('etablissement_2')->nullable();
            $table->string('ville')->nullable();
            $table->string('universite')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('etablissements');
    }
};