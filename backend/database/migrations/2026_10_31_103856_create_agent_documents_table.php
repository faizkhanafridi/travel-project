<?php

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
            $table->foreignId('agent_id')->constrained()->cascadeOnDelete();
            $table->string('type', 40)->index();
            $table->string('original_name');
            $table->string('storage_path');
            $table->string('mime', 100);
            $table->unsignedBigInteger('size');
            $table->boolean('is_approved')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agent_documents');
    }
};