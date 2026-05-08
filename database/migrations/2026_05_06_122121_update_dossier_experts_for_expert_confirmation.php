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
                if (!Schema::hasColumn('dossier_experts', 'status')) {
                    $table->string('status')->default('en_attente_confirmation_dee');
                }

                if (!Schema::hasColumn('dossier_experts', 'invitation_token')) {
                    $table->string('invitation_token')->nullable()->unique();
                }

                if (!Schema::hasColumn('dossier_experts', 'access_sent_at')) {
                    $table->timestamp('access_sent_at')->nullable();
                }

                if (!Schema::hasColumn('dossier_experts', 'dee_confirmed_at')) {
                    $table->timestamp('dee_confirmed_at')->nullable();
                }

                if (!Schema::hasColumn('dossier_experts', 'expert_confirmed_at')) {
                    $table->timestamp('expert_confirmed_at')->nullable();
                }

                if (!Schema::hasColumn('dossier_experts', 'expert_refused_at')) {
                    $table->timestamp('expert_refused_at')->nullable();
                }
            });
        }

        if (Schema::hasTable('experts')) {
            Schema::table('experts', function (Blueprint $table) {
                if (!Schema::hasColumn('experts', 'user_id')) {
                    $table->foreignId('user_id')
                        ->nullable()
                        ->constrained('users')
                        ->nullOnDelete();
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('dossier_experts')) {
            Schema::table('dossier_experts', function (Blueprint $table) {
                foreach ([
                    'expert_refused_at',
                    'expert_confirmed_at',
                    'dee_confirmed_at',
                    'access_sent_at',
                    'invitation_token',
                    'status',
                ] as $column) {
                    if (Schema::hasColumn('dossier_experts', $column)) {
                        $table->dropColumn($column);
                    }
                }
            });
        }

        if (Schema::hasTable('experts') && Schema::hasColumn('experts', 'user_id')) {
            Schema::table('experts', function (Blueprint $table) {
                $table->dropConstrainedForeignId('user_id');
            });
        }
    }
};