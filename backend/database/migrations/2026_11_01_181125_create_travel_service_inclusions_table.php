<?php
// database/migrations/2024_01_04_000400_create_travel_service_inclusions_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('travel_service_inclusions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('travel_service_id')->constrained('travel_services')->cascadeOnDelete();
            $table->string('label', 200);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('travel_service_inclusions');
    }
};