<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('recommandation_rappels')) return;

        // MySQL: alter ENUM by redefining the column
        DB::statement("ALTER TABLE recommandation_rappels MODIFY COLUMN type ENUM('standard','personnalise','alerte_dee') NOT NULL DEFAULT 'standard'");
    }

    public function down(): void
    {
        if (!Schema::hasTable('recommandation_rappels')) return;
        DB::statement("ALTER TABLE recommandation_rappels MODIFY COLUMN type ENUM('standard','personnalise') NOT NULL DEFAULT 'standard'");
    }
};
