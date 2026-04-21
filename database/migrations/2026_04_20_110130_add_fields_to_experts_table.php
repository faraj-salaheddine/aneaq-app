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
        $table->string('cin_number')->nullable();
        $table->date('contract_start')->nullable();
        $table->date('contract_end')->nullable();
        $table->integer('contract_renewals')->default(0);
        $table->integer('car_horsepower')->nullable();
    });
}

public function down()
{
    Schema::table('experts', function (Blueprint $table) {
        $table->dropColumn(['cin_number', 'contract_start', 'contract_end', 'contract_renewals', 'car_horsepower']);
    });
}
};
