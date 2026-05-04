<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('dossier_experts')) {
            Schema::table('dossier_experts', function (Blueprint $table) {
                if (!Schema::hasColumn('dossier_experts', 'role_expert')) {
                    $table->string('role_expert')->default('expert')->after('expert_id');
                }

                if (!Schema::hasColumn('dossier_experts', 'status')) {
                    $table->string('status')->default('en_attente_confirmation_dee')->after('role_expert');
                }

                if (!Schema::hasColumn('dossier_experts', 'invitation_token')) {
                    $table->string('invitation_token')->nullable()->after('status');
                }

                if (!Schema::hasColumn('dossier_experts', 'access_sent_at')) {
                    $table->timestamp('access_sent_at')->nullable()->after('invitation_token');
                }

                if (!Schema::hasColumn('dossier_experts', 'dee_confirmed_at')) {
                    $table->timestamp('dee_confirmed_at')->nullable()->after('access_sent_at');
                }

                if (!Schema::hasColumn('dossier_experts', 'expert_confirmed_at')) {
                    $table->timestamp('expert_confirmed_at')->nullable()->after('dee_confirmed_at');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('dossier_experts')) {
            Schema::table('dossier_experts', function (Blueprint $table) {
                foreach ([
                    'expert_confirmed_at',
                    'dee_confirmed_at',
                    'access_sent_at',
                    'invitation_token',
                    'status',
                    'role_expert',
                ] as $column) {
                    if (Schema::hasColumn('dossier_experts', $column)) {
                        $table->dropColumn($column);
                    }
                }
            });
        }
    }
};