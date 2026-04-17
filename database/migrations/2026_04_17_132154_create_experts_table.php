<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('experts', function (Blueprint $table) {
            $table->id();

            $table->string('nom');
            $table->string('prenom');
            $table->string('date_naissance')->nullable();
            $table->string('ville')->nullable();
            $table->string('pays')->nullable();
            $table->string('telephone')->nullable();
            $table->string('email')->nullable();

            $table->longText('diplomes_obtenus')->nullable();
            $table->text('specialite')->nullable();
            $table->text('annee')->nullable();

            $table->text('fonction_actuelle')->nullable();
            $table->text('universite_ou_departement_ministeriel')->nullable();
            $table->string('type_etablissement')->nullable();
            $table->text('etablissement')->nullable();

            $table->text('date_recrutement')->nullable();
            $table->text('grade')->nullable();
            $table->longText('responsabilite')->nullable();
            $table->longText('etablissement_et_annee_responsabilite')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('experts');
    }
};