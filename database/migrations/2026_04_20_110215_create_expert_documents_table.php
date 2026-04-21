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
    Schema::create('expert_documents', function (Blueprint $table) {
        $table->id();
        $table->foreignId('expert_id')->constrained()->onDelete('cascade');
        $table->enum('type', ['cin', 'contract', 'carte_grise']);
        $table->string('file_path');
        $table->string('original_name');
        $table->string('mime_type');
        $table->unsignedBigInteger('file_size');
        $table->timestamps();
    });
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expert_documents');
    }
};
