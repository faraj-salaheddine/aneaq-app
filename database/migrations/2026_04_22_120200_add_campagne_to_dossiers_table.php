<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('dossiers', function (Blueprint $table) {
            if (! Schema::hasColumn('dossiers', 'campagne_evaluation_id')) {
                $table->foreignId('campagne_evaluation_id')->nullable()->after('id')->constrained('campagne_evaluations')->nullOnDelete();
            }
        });

        DB::statement('ALTER TABLE dossiers MODIFY description TEXT NULL');

        Schema::table('campagne_etablissements', function (Blueprint $table) {
            $table->foreign('dossier_id')->references('id')->on('dossiers')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('campagne_etablissements', function (Blueprint $table) {
            $table->dropForeign(['dossier_id']);
        });

        Schema::table('dossiers', function (Blueprint $table) {
            if (Schema::hasColumn('dossiers', 'campagne_evaluation_id')) {
                $table->dropConstrainedForeignId('campagne_evaluation_id');
            }
        });
    }
};
