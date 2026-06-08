<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('dossiers', function (Blueprint $table) {
            $table->timestamp('annexes_envoyees_experts_at')->nullable()->after('visite_message_etab');
        });
    }

    public function down(): void
    {
        Schema::table('dossiers', function (Blueprint $table) {
            $table->dropColumn('annexes_envoyees_experts_at');
        });
    }
};
