<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
{
    DB::statement("ALTER TABLE expert_documents MODIFY COLUMN type ENUM('cin', 'contract', 'carte_grise', 'rib')");
}

public function down()
{
    DB::statement("ALTER TABLE expert_documents MODIFY COLUMN type ENUM('cin', 'contract', 'carte_grise')");
}
};
