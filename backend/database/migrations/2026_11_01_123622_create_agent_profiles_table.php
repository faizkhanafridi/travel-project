<?php
// database/migrations/2024_01_03_000200_create_agent_profiles_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agent_profiles', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('agent_id')->unique()->constrained('agents')->cascadeOnDelete();

            // Step 1 — Agency Information
            $table->string('agency_name')->nullable();
            $table->string('agency_owner_name')->nullable();
            $table->string('agency_phone', 30)->nullable();
            $table->string('agency_country')->nullable();
            $table->string('agency_city')->nullable();
            $table->string('agency_address')->nullable();

            // Step 2 — Business Information
            $table->text('business_description')->nullable();
            $table->unsignedSmallInteger('years_in_business')->nullable();
            $table->string('business_type')->nullable();
            $table->string('registration_number')->nullable();
            $table->string('website')->nullable();
            $table->json('social_media')->nullable();
            $table->json('languages')->nullable();
            $table->json('specializations')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agent_profiles');
    }
};