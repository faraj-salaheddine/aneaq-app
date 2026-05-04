<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('dossier_experts', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('expert_id')->constrained('users')->nullOnDelete();
            $table->string('status')->default('en_attente_confirmation_expert')->after('user_id');
            $table->string('invitation_token')->nullable()->unique()->after('status');
            $table->timestamp('invitation_sent_at')->nullable()->after('invitation_token');
            $table->timestamp('expert_confirmed_at')->nullable()->after('invitation_sent_at');
            $table->timestamp('dee_confirmed_at')->nullable()->after('expert_confirmed_at');
        });
    }

    public function down(): void
    {
        Schema::table('dossier_experts', function (Blueprint $table) {
            $table->dropConstrainedForeignId('user_id');
            $table->dropColumn([
                'status',
                'invitation_token',
                'invitation_sent_at',
                'expert_confirmed_at',
                'dee_confirmed_at',
            ]);
        });
    }
};