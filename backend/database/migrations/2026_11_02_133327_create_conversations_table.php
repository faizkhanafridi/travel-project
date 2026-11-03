<?php
// database/migrations/2024_01_06_000100_create_conversations_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('conversations', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('type')->default('customer_agent'); // reserved for future: group, support
            $table->foreignId('customer_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('agent_id')->constrained('agents')->cascadeOnDelete();
            $table->foreignId('travel_service_id')->nullable()->constrained('travel_services')->nullOnDelete();
            $table->timestamp('last_message_at')->nullable();
            $table->timestamps();

            // one thread per (customer, agent) pair
            $table->unique(['customer_id', 'agent_id']);
            $table->index('last_message_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};