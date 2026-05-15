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
        Schema::table('messages_dossier', function (Blueprint $table) {
            $table->boolean('lu_par_etablissement')->default(false)->after('lu_par_expert');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('messages_dossier', function (Blueprint $table) {
            $table->dropColumn('lu_par_etablissement');
        });
    }
};
