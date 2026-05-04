<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('etablissement_onboardings', function (Blueprint $table) {
            if (!Schema::hasColumn('etablissement_onboardings', 'campagne_evaluation_id')) {
                $table->foreignId('campagne_evaluation_id')
                    ->nullable()
                    ->after('etablissement_id')
                    ->constrained('campagne_evaluations')
                    ->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('etablissement_onboardings', function (Blueprint $table) {
            if (Schema::hasColumn('etablissement_onboardings', 'campagne_evaluation_id')) {
                $table->dropConstrainedForeignId('campagne_evaluation_id');
            }
        });
    }
};