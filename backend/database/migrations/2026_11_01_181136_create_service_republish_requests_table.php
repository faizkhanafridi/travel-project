<?php
// database/migrations/2024_01_04_000800_create_service_republish_requests_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_republish_requests', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('travel_service_id')->constrained('travel_services')->cascadeOnDelete();
            $table->foreignId('agent_id')->constrained('agents');
            $table->string('status')->default('PENDING'); // PENDING, APPROVED, REJECTED
            $table->text('reason');
            $table->text('rejection_reason')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['travel_service_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_republish_requests');
    }
};