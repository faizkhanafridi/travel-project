<?php
// database/migrations/2024_01_04_000200_create_travel_services_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('travel_services', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('agent_id')->constrained('agents')->cascadeOnDelete();
            $table->foreignId('category_id')->constrained('service_categories');
            $table->foreignId('subcategory_id')->constrained('service_categories');

            $table->string('title');
            $table->string('slug');
            $table->string('short_description', 500)->nullable();
            $table->text('full_description');
            $table->decimal('price', 12, 2);                 // USD base
            $table->string('currency', 3)->default('USD');   // base currency for this service
            $table->string('destination_country');
            $table->string('destination_city');
            $table->unsignedInteger('duration');
            $table->string('duration_unit', 20); // days, hours, one-time, ...
            $table->text('cancellation_policy')->nullable();

            $table->string('status')->default('DRAFT');
            $table->unsignedInteger('attempt')->default(0);
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('rejection_reason')->nullable();
            $table->timestamp('suspended_at')->nullable();

            // Wizard step flags
            $table->boolean('step_basic_saved')->default(false);
            $table->boolean('step_details_saved')->default(false);
            $table->boolean('step_gallery_saved')->default(false);
            $table->boolean('step_requirements_saved')->default(false);

            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'published_at']);
            $table->index('agent_id');
            $table->index(['category_id', 'subcategory_id']);
            $table->unique(['agent_id', 'slug']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('travel_services');
    }
};