<?php
// database/migrations/2024_01_04_001000_create_exchange_rates_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exchange_rates', function (Blueprint $table) {
            $table->id();
            $table->string('base', 3)->default('USD');
            $table->string('quote', 3);
            $table->decimal('rate', 18, 8); // 1 base = rate quote
            $table->timestamp('fetched_at');
            $table->timestamps();

            $table->unique(['base', 'quote']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exchange_rates');
    }
};