<?php
// database/migrations/2024_01_07_000500_create_connect_transactions_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('connect_transactions', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('agent_id')->constrained('agents')->cascadeOnDelete();
            $table->string('type', 30); // initial_award | offer_spend | refund | purchase
            $table->integer('amount'); // positive for credit, negative for debit
            $table->integer('balance_after');
            $table->string('reference_type', 40)->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->string('note', 255)->nullable();
            $table->timestamps();

            $table->index(['agent_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('connect_transactions');
    }
};