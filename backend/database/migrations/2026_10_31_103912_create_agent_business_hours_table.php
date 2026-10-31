<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agent_business_hours', function (Blueprint $table) {
            $table->id();
            $table->foreignId('agent_id')->constrained()->cascadeOnDelete();
            // 0 = Sunday, 6 = Saturday
            $table->unsignedTinyInteger('day_of_week');
            $table->boolean('is_closed')->default(false);
            $table->time('open_time')->nullable();
            $table->time('close_time')->nullable();
            $table->timestamps();

            $table->unique(['agent_id', 'day_of_week']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agent_business_hours');
    }
};