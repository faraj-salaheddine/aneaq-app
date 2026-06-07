<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE rapports_experts MODIFY COLUMN statut ENUM('depose','valide','rejete','envoye_etablissement') NOT NULL DEFAULT 'depose'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE rapports_experts MODIFY COLUMN statut ENUM('depose','valide','rejete') NOT NULL DEFAULT 'depose'");
    }
};
