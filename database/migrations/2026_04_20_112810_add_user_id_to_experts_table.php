<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    Schema::table('experts', function (Blueprint $table) {
        $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null')->after('id');
    });
}

public function down()
{
    Schema::table('experts', function (Blueprint $table) {
        $table->dropForeign(['user_id']);
        $table->dropColumn('user_id');
    });
}
};
