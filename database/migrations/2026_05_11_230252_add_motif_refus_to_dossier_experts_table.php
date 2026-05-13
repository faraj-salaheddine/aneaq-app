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
            if (!Schema::hasColumn('dossier_experts', 'motif_refus')) {
                $table->text('motif_refus')->nullable()->after('expert_refused_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('dossier_experts', function (Blueprint $table) {
            if (Schema::hasColumn('dossier_experts', 'motif_refus')) {
                $table->dropColumn('motif_refus');
            }
        });
    }
};
