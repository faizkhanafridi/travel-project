<?php
// database/migrations/2024_01_07_000200_create_travel_offers_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('travel_offers', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('travel_post_id')->constrained('travel_posts')->cascadeOnDelete();
            $table->foreignId('agent_id')->constrained('agents')->cascadeOnDelete();

            $table->decimal('amount', 12, 2);
            $table->string('currency', 3)->default('USD');
            $table->unsignedInteger('duration');
            $table->string('duration_unit', 20);

            $table->text('message');
            $table->json('inclusions')->nullable();  // array of strings
            $table->text('itinerary')->nullable();

            $table->unsignedInteger('connects_spent')->default(0); // 6 for global posts, 0 for service_request

            $table->string('status', 20)->default('PENDING'); // PENDING | SHORTLISTED | ACCEPTED | REJECTED | WITHDRAWN
            $table->timestamp('decided_at')->nullable();

            $table->timestamps();

            $table->unique(['travel_post_id', 'agent_id']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('travel_offers');
    }
};