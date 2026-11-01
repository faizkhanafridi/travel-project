<?php
// database/migrations/2024_01_03_000100_create_agents_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agents', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('status')->default('DRAFT'); // DRAFT, PENDING_REVIEW, UNDER_REVIEW, APPROVED, REJECTED, SUSPENDED
            $table->unsignedInteger('attempt')->default(0); // incremented on each submit
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('rejection_reason')->nullable();
            $table->timestamp('approved_at')->nullable();
            // Wizard step completion flags
            $table->boolean('step_agency_saved')->default(false);
            $table->boolean('step_business_saved')->default(false);
            $table->boolean('step_documents_saved')->default(false);
            $table->boolean('step_hours_saved')->default(false);
            // Connects (temporary — remove when Finance exists)
            $table->unsignedInteger('connects_balance')->default(0);
            $table->boolean('connects_awarded')->default(false);
            $table->timestamps();

            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agents');
    }
};