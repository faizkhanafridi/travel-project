<?php
// database/migrations/2024_01_04_000300_create_travel_service_tags_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('travel_service_tags', function (Blueprint $table) {
            $table->id();
            $table->foreignId('travel_service_id')->constrained('travel_services')->cascadeOnDelete();
            $table->string('tag', 60);
            $table->timestamps();

            $table->index('tag');
            $table->unique(['travel_service_id', 'tag']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('travel_service_tags');
    }
};