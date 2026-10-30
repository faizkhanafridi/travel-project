<?php

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
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('new_email');
            $table->string('method', 40); // current_email_code | password
            $table->string('step', 60);
            $table->string('current_email_code')->nullable(); // hashed
            $table->string('new_email_code')->nullable(); // hashed
            $table->unsignedTinyInteger('current_email_attempts')->default(0);
            $table->unsignedTinyInteger('new_email_attempts')->default(0);
            $table->timestamp('current_email_expires_at')->nullable();
            $table->timestamp('new_email_expires_at')->nullable();
            $table->timestamp('last_sent_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'step']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_change_requests');
    }
};