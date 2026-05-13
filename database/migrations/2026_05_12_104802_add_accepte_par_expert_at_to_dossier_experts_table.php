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
        Schema::table('dossier_experts', function (Blueprint $table) {
            $table->timestamp('accepte_par_expert_at')->nullable()->after('expert_confirmed_at');
        });
    }

    public function down(): void
    {
        Schema::table('dossier_experts', function (Blueprint $table) {
            $table->dropColumn('accepte_par_expert_at');
        });
    }
};
