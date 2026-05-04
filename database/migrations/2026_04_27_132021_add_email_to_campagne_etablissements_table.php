<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('campagne_etablissements', function (Blueprint $table) {
            if (!Schema::hasColumn('campagne_etablissements', 'email')) {
                $table->string('email')->nullable()->after('etablissement_id');
            }

            if (!Schema::hasColumn('campagne_etablissements', 'access_sent_at')) {
                $table->timestamp('access_sent_at')->nullable()->after('statut');
            }
        });
    }

    public function down(): void
    {
        Schema::table('campagne_etablissements', function (Blueprint $table) {
            if (Schema::hasColumn('campagne_etablissements', 'email')) {
                $table->dropColumn('email');
            }

            if (Schema::hasColumn('campagne_etablissements', 'access_sent_at')) {
                $table->dropColumn('access_sent_at');
            }
        });
    }
};