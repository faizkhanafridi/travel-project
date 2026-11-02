<?php
// database/migrations/2024_01_04_000900_create_travel_service_submission_history_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('travel_service_submission_history', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('travel_service_id')->constrained('travel_services')->cascadeOnDelete();
            $table->unsignedInteger('attempt')->nullable();       // only for submit/reject/approve on initial approval
            $table->string('action');                             // submitted, under_review, approved, rejected, unpublished, published, republish_requested, republish_approved, republish_rejected, suspended, unsuspended
            $table->text('reason')->nullable();
            $table->foreignId('admin_id')->nullable()->constrained('users')->nullOnDelete();
            $table->json('snapshot')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('travel_service_submission_history');
    }
};