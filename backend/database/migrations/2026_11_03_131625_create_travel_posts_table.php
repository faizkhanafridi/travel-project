<?php
// database/migrations/2024_01_07_000100_create_travel_posts_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('travel_posts', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('customer_id')->constrained('users')->cascadeOnDelete();

            // 'global' | 'service_request'
            $table->string('type', 20)->default('global');
            $table->string('status', 20)->default('OPEN');

            // Optional when type = global; required when type = service_request
            $table->foreignId('travel_service_id')->nullable()->constrained('travel_services')->nullOnDelete();
            $table->foreignId('agent_id')->nullable()->constrained('agents')->nullOnDelete();

            // Basic
            $table->string('title');
            $table->text('description');

            // Category (needed for milestone_model downstream)
            $table->foreignId('category_id')->nullable()->constrained('service_categories');
            $table->foreignId('subcategory_id')->nullable()->constrained('service_categories');
            $table->string('milestone_model', 20)->default('1_step');

            // Trip basics
            $table->unsignedInteger('duration');
            $table->string('duration_unit', 20);
            $table->string('destination_country');
            $table->string('destination_city');

            // Dates
            $table->date('travel_date')->nullable();
            $table->date('preferred_date')->nullable();

            // Travelers
            $table->unsignedInteger('travelers_total')->default(1);
            $table->unsignedInteger('travelers_adults')->default(1);
            $table->unsignedInteger('travelers_children')->default(0);

            // Budget (USD)
            $table->decimal('budget_min', 12, 2)->nullable();
            $table->decimal('budget_max', 12, 2)->nullable();
            $table->string('currency', 3)->default('USD');

            // Services needed (array of strings) for global posts
            $table->json('services_needed')->nullable();
            // Additional requirements text
            $table->text('additional_requirements')->nullable();

            // Auto close after this
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('offers_close_at')->nullable();

            // When the customer accepts an offer, link it
            $table->foreignId('accepted_offer_id')->nullable();

            $table->timestamps();

            $table->index(['status', 'type']);
            $table->index('customer_id');
            $table->index(['category_id', 'subcategory_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('travel_posts');
    }
};