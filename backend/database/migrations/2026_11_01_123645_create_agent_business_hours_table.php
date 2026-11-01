<?php
// database/migrations/2024_01_03_000400_create_agent_business_hours_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agent_business_hours', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agent_id')->constrained('agents')->cascadeOnDelete();
            $table->unsignedTinyInteger('day_of_week'); // 0 = Sunday ... 6 = Saturday
            $table->boolean('is_closed')->default(false);
            $table->string('open_time', 5)->nullable();  // "09:00"
            $table->string('close_time', 5)->nullable(); // "18:00"
            $table->timestamps();

            $table->unique(['agent_id', 'day_of_week']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agent_business_hours');
    }
};