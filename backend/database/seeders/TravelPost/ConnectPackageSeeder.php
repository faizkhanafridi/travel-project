<?php
// database/seeders/TravelPost/ConnectPackageSeeder.php

namespace Database\Seeders\TravelPost;

use App\Models\TravelPost\ConnectPackage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ConnectPackageSeeder extends Seeder
{
    public function run(): void
    {
        $packages = [
            ['connects' => 100, 'price_usd' => 10.00],
            ['connects' => 150, 'price_usd' => 15.00],
            ['connects' => 200, 'price_usd' => 20.00],
            ['connects' => 300, 'price_usd' => 28.00],
            ['connects' => 500, 'price_usd' => 45.00],
        ];

        foreach ($packages as $i => $row) {
            ConnectPackage::updateOrCreate(
                ['connects' => $row['connects']],
                [
                    'uuid' => (string) Str::uuid(),
                    'price_usd' => $row['price_usd'],
                    'is_active' => true,
                    'sort_order' => $i,
                ]
            );
        }
    }
}