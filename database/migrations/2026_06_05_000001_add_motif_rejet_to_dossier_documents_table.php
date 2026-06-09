<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('dossier_documents') && !Schema::hasColumn('dossier_documents', 'motif_rejet')) {
            Schema::table('dossier_documents', function (Blueprint $table) {
                $table->text('motif_rejet')->nullable()->after('observation');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('dossier_documents') && Schema::hasColumn('dossier_documents', 'motif_rejet')) {
            Schema::table('dossier_documents', function (Blueprint $table) {
                $table->dropColumn('motif_rejet');
            });
        }
    }
};
