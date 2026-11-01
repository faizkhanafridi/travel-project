<?php
// database/migrations/2024_01_03_000300_create_agent_documents_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agent_documents', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('agent_id')->constrained('agents')->cascadeOnDelete();
            $table->string('type'); // business_registration, license, identity, other
            $table->string('original_name');
            $table->string('file_path');
            $table->string('mime_type', 100);
            $table->unsignedBigInteger('size_bytes');
            $table->timestamp('locked_at')->nullable(); // set when agent approved — becomes view-only
            $table->timestamps();

            $table->index(['agent_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agent_documents');
    }
};