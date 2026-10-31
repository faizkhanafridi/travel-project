<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agent_application_attempts', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('agent_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('attempt_number');
            $table->string('status', 30)->index();
            $table->timestamp('submitted_at');
            $table->timestamp('reviewed_at')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();

            $table->unique(['agent_id', 'attempt_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agent_application_attempts');
    }
};