<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agent_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agent_id')->unique()->constrained()->cascadeOnDelete();

            // Agency information
            $table->string('agency_name')->nullable();
            $table->string('agency_owner_name')->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('country', 80)->nullable();
            $table->string('city', 120)->nullable();
            $table->text('address')->nullable();
            $table->boolean('agency_information_completed')->default(false);

            // Business information
            $table->text('business_description')->nullable();
            $table->unsignedSmallInteger('years_in_business')->nullable();
            $table->string('business_type', 80)->nullable();
            $table->text('registration_information')->nullable();
            $table->string('website')->nullable();
            $table->json('social_media')->nullable();
            $table->json('languages')->nullable();
            $table->json('specializations')->nullable();
            $table->boolean('business_information_completed')->default(false);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agent_profiles');
    }
};