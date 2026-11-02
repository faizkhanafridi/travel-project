<?php
// database/migrations/2024_01_04_000600_create_travel_service_images_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('travel_service_images', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('travel_service_id')->constrained('travel_services')->cascadeOnDelete();
            $table->string('file_path');
            $table->string('mime_type', 100);
            $table->unsignedBigInteger('size_bytes');
            $table->boolean('is_cover')->default(false);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['travel_service_id', 'is_cover']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('travel_service_images');
    }
};