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
    Schema::table('users', function (Blueprint $table) {
        // Ajout de la colonne rôle pour gérer les accès par profil (si, expert, etablissement, admin)
        $table->string('role')->default('user');
    });
}

public function down(): void
{
    Schema::table('users', function (Blueprint $table) {
        // Suppression de la colonne rôle en cas de rollback
        $table->dropColumn('role');
    });
}
};
