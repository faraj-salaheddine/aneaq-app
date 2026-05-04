<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('campagne_etablissements', 'access_sent_at')) {
            Schema::table('campagne_etablissements', function (Blueprint $table) {
                $table->timestamp('access_sent_at')->nullable()->after('statut');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('campagne_etablissements', 'access_sent_at')) {
            Schema::table('campagne_etablissements', function (Blueprint $table) {
                $table->dropColumn('access_sent_at');
            });
        }
    }
};