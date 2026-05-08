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
    Schema::table('activity_logs', function (Blueprint $table) {
        $table->string('model_type')->nullable()->after('action');
        $table->unsignedBigInteger('model_id')->nullable()->after('model_type');
        $table->string('model_name')->nullable()->after('model_id');
        $table->string('performed_by')->nullable()->after('model_name');
        $table->string('role')->nullable()->after('performed_by');
        $table->text('details')->nullable()->after('role');
    });
}

public function down()
{
    Schema::table('activity_logs', function (Blueprint $table) {
        $table->dropColumn(['model_type', 'model_id', 'model_name', 'performed_by', 'role', 'details']);
    });
}
};
