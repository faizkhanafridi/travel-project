<?php
// database/seeders/TravelService/ServiceCategorySeeder.php

namespace Database\Seeders\TravelService;

use App\Models\TravelService\ServiceCategory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ServiceCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['category' => 'Travel Packages', 'requires_packages' => true, 'milestone_model' => '2_step',
             'sub_category' => ['Religious Pilgrimage', 'Adventure Tours', 'Cultural & Historical Tours',
                'Family Package Tours', 'Honeymoon Packages', 'International Holidays', 'Domestic/Local Tours']],
            ['category' => 'Accommodations', 'requires_packages' => false, 'milestone_model' => '1_step',
             'sub_category' => ['Hotels & Resorts', 'Guest Houses & Homestays', 'Serviced Apartments']],
            ['category' => 'Transport & Tickets', 'requires_packages' => false, 'milestone_model' => '1_step',
             'sub_category' => ['Flight Tickets', 'Bus Bookings', 'Train Tickets', 'Car Rentals & Airport Transfers']],
        ];

        $order = 0;
        foreach ($categories as $row) {
            $cat = ServiceCategory::updateOrCreate(
                ['slug' => Str::slug($row['category'])],
                [
                    'uuid' => (string) Str::uuid(),
                    'name' => $row['category'],
                    'parent_id' => null,
                    'requires_packages' => $row['requires_packages'],
                    'milestone_model' => $row['milestone_model'],
                    'sort_order' => $order++,
                ]
            );

            $subOrder = 0;
            foreach ($row['sub_category'] as $sub) {
                ServiceCategory::updateOrCreate(
                    ['slug' => Str::slug($row['category'] . '-' . $sub)],
                    [
                        'uuid' => (string) Str::uuid(),
                        'name' => $sub,
                        'parent_id' => $cat->id,
                        'requires_packages' => $row['requires_packages'],
                        'milestone_model' => $row['milestone_model'],
                        'sort_order' => $subOrder++,
                    ]
                );
            }
        }
    }
}