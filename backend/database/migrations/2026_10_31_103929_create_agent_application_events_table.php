<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('agent_application_events', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('agent_id')->constrained()->cascadeOnDelete();
            $table->foreignId('attempt_id')->nullable()->constrained('agent_application_attempts')->nullOnDelete();
            $table->string('event', 40)->index();
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('note')->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('agent_application_events');
    }
};