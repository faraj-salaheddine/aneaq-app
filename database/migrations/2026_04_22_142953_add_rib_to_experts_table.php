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
        $table->string('rib', 24)->nullable()->after('car_horsepower');
    });
}

public function down()
{
    Schema::table('experts', function (Blueprint $table) {
        $table->dropColumn('rib');
    });
}
};
