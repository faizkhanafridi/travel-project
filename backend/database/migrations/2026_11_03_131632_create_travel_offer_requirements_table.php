<?php
// database/migrations/2024_01_07_000300_create_travel_offer_requirements_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('travel_offer_requirements', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('travel_offer_id')->constrained('travel_offers')->cascadeOnDelete();
            $table->string('title', 200);
            $table->text('description')->nullable();
            $table->string('answer_type', 20)->default('text'); // text|textarea|file|number|date
            $table->json('validation_config')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('travel_offer_requirements');
    }
};