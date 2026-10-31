<?php
// database/migrations/2024_01_01_000100_create_auth_support_tables.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pending_registrations', function (Blueprint $table) {
            $table->id();
            $table->string('email')->unique();
            $table->string('name');
            $table->string('password'); // pre-hashed
            $table->string('code_hash');
            $table->unsignedTinyInteger('attempts')->default(0);
            $table->timestamp('expires_at');
            $table->timestamp('last_sent_at')->nullable();
            $table->string('registered_from_ip', 45)->nullable();
            $table->timestamps();
        });

        Schema::create('password_reset_codes', function (Blueprint $table) {
            $table->id();
            $table->string('email')->index();
            $table->string('code_hash');
            $table->unsignedTinyInteger('attempts')->default(0);
            $table->timestamp('expires_at');
            $table->timestamp('last_sent_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('password_reset_codes');
        Schema::dropIfExists('pending_registrations');
    }
};