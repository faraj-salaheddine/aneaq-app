<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::create('utilisateurs_dee', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        $table->string('nom');
        $table->string('prenom');
        $table->string('telephone')->nullable();
        $table->enum('role', ['dee', 'chef_dee']);
        $table->timestamps();
    });
}

public function down()
{
    Schema::dropIfExists('utilisateurs_dee');
}
};
