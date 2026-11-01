<?php
// database/migrations/2024_01_02_000200_create_email_change_requests_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('email_change_requests', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('new_email');
            $table->string('current_email_code_hash')->nullable();
            $table->string('new_email_code_hash')->nullable();
            $table->boolean('password_verified')->default(false);
            $table->string('stage')->default('CURRENT_EMAIL_VERIFY');
            $table->unsignedTinyInteger('current_email_attempts')->default(0);
            $table->unsignedTinyInteger('new_email_attempts')->default(0);
            $table->timestamp('current_email_expires_at')->nullable();
            $table->timestamp('new_email_expires_at')->nullable();
            $table->timestamp('last_sent_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'stage']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_change_requests');
    }
};