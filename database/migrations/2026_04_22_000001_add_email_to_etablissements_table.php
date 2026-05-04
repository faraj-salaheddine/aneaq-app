<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('etablissements', 'email')) {
            Schema::table('etablissements', function (Blueprint $table) {
                $table->string('email')->nullable()->after('universite');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('etablissements', 'email')) {
            Schema::table('etablissements', function (Blueprint $table) {
                $table->dropColumn('email');
            });
        }
    }
};