<?php
// database/migrations/2024_01_03_000500_create_agent_submission_history_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agent_submission_history', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('agent_id')->constrained('agents')->cascadeOnDelete();
            $table->unsignedInteger('attempt');
            $table->string('action'); // submitted, under_review, approved, rejected
            $table->text('reason')->nullable();
            $table->foreignId('admin_id')->nullable()->constrained('users')->nullOnDelete();
            $table->json('snapshot')->nullable(); // frozen agency/business snapshot at time of action
            $table->timestamps();

            $table->index(['agent_id', 'attempt']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agent_submission_history');
    }
};