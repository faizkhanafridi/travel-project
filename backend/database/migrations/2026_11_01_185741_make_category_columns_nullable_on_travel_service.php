<?php
// database/migrations/xxxx_xx_xx_xxxxxx_make_category_columns_nullable_on_travel_services.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('travel_services', function (Blueprint $table) {
            $table->foreignId('category_id')->nullable()->change();
            $table->foreignId('subcategory_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('travel_services', function (Blueprint $table) {
            $table->foreignId('category_id')->nullable(false)->change();
            $table->foreignId('subcategory_id')->nullable(false)->change();
        });
    }
};