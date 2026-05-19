<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('rapports_experts', function (Blueprint $table) {
            if (!Schema::hasColumn('rapports_experts', 'titre')) {
                $table->string('titre')->nullable()->after('expert_id');
            }
            if (!Schema::hasColumn('rapports_experts', 'commentaire')) {
                $table->text('commentaire')->nullable()->after('titre');
            }
            if (!Schema::hasColumn('rapports_experts', 'fichier')) {
                $table->string('fichier')->nullable()->after('commentaire');
            }
        });
    }

    public function down(): void
    {
        Schema::table('rapports_experts', function (Blueprint $table) {
            foreach (['titre', 'commentaire', 'fichier'] as $col) {
                if (Schema::hasColumn('rapports_experts', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
