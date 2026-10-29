<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pending_registrations', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('email')->index();
            $table->string('password'); // hashed
            $table->string('verification_code'); // hashed
            $table->unsignedTinyInteger('attempts')->default(0);
            $table->timestamp('expires_at');
            $table->timestamp('last_sent_at')->nullable();
            $table->ipAddress('ip_address')->nullable();
            $table->timestamps();

            // Prevent duplicate pending registrations for the same email
            $table->unique('email');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pending_registrations');
    }
};