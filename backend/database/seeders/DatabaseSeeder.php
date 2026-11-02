<?php
// database/seeders/DatabaseSeeder.php

namespace Database\Seeders;

use Database\Seeders\Auth\RoleSeeder;
use Database\Seeders\Auth\SuperAdminSeeder;
use Database\Seeders\TravelService\ServiceCategorySeeder;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,
            SuperAdminSeeder::class,

            ServiceCategorySeeder::class,
        ]);
    }
}