<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('campagne_evaluations')) {
            try {
                DB::statement("ALTER TABLE campagne_evaluations MODIFY statut VARCHAR(50) NOT NULL DEFAULT 'brouillon'");
            } catch (Throwable $e) {
                // Ignore si la colonne est déjà compatible
            }
        }

        if (Schema::hasTable('campagne_etablissements')) {
            Schema::table('campagne_etablissements', function (Blueprint $table) {
                if (!Schema::hasColumn('campagne_etablissements', 'email')) {
                    $table->string('email')->nullable()->after('statut');
                }

                if (!Schema::hasColumn('campagne_etablissements', 'access_sent_at')) {
                    $table->timestamp('access_sent_at')->nullable()->after('email');
                }
            });
        }

        if (Schema::hasTable('dossiers')) {
            Schema::table('dossiers', function (Blueprint $table) {
                if (!Schema::hasColumn('dossiers', 'campagne_etablissement_id')) {
                    $table->foreignId('campagne_etablissement_id')->nullable()->after('id');
                }

                if (!Schema::hasColumn('dossiers', 'campagne_evaluation_id')) {
                    $table->foreignId('campagne_evaluation_id')->nullable()->after('campagne_etablissement_id');
                }

                if (!Schema::hasColumn('dossiers', 'etablissement_id')) {
                    $table->foreignId('etablissement_id')->nullable()->after('campagne_evaluation_id');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('campagne_etablissements')) {
            Schema::table('campagne_etablissements', function (Blueprint $table) {
                if (Schema::hasColumn('campagne_etablissements', 'access_sent_at')) {
                    $table->dropColumn('access_sent_at');
                }

                if (Schema::hasColumn('campagne_etablissements', 'email')) {
                    $table->dropColumn('email');
                }
            });
        }

        if (Schema::hasTable('dossiers')) {
            Schema::table('dossiers', function (Blueprint $table) {
                if (Schema::hasColumn('dossiers', 'campagne_etablissement_id')) {
                    $table->dropColumn('campagne_etablissement_id');
                }

                if (Schema::hasColumn('dossiers', 'campagne_evaluation_id')) {
                    $table->dropColumn('campagne_evaluation_id');
                }

                if (Schema::hasColumn('dossiers', 'etablissement_id')) {
                    $table->dropColumn('etablissement_id');
                }
            });
        }
    }
};