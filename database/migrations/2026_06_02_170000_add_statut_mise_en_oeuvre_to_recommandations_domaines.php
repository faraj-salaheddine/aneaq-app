<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('recommandations_domaines')) {
            return;
        }

        Schema::table('recommandations_domaines', function (Blueprint $table) {
            if (!Schema::hasColumn('recommandations_domaines', 'statut_mise_en_oeuvre')) {
                $table->string('statut_mise_en_oeuvre', 30)
                    ->default('non_demarree')
                    ->after('statut');
            }
        });

        DB::table('recommandations_domaines')
            ->where('statut', 'en_cours')
            ->update(['statut_mise_en_oeuvre' => 'en_cours']);

        DB::table('recommandations_domaines')
            ->where('statut', 'cloturee')
            ->update(['statut_mise_en_oeuvre' => 'realisee']);
    }

    public function down(): void
    {
        if (!Schema::hasTable('recommandations_domaines')) {
            return;
        }

        Schema::table('recommandations_domaines', function (Blueprint $table) {
            if (Schema::hasColumn('recommandations_domaines', 'statut_mise_en_oeuvre')) {
                $table->dropColumn('statut_mise_en_oeuvre');
            }
        });
    }
};
