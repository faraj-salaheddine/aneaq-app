<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('campagne_evaluations', function (Blueprint $table) {
            $table->string('created_by_name')->nullable()->after('created_by');
        });
    }

    public function down(): void
    {
        Schema::table('campagne_evaluations', function (Blueprint $table) {
            $table->dropColumn('created_by_name');
        });
    }
};