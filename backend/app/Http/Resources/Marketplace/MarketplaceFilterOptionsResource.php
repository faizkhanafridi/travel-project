<?php
// app/Http/Resources/Marketplace/MarketplaceFilterOptionsResource.php

namespace App\Http\Resources\Marketplace;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MarketplaceFilterOptionsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'countries' => $this->resource['countries'],
            'cities' => $this->resource['cities'],
            'duration_units' => $this->resource['duration_units'],
            'price_range' => $this->resource['price_range'],
            'subcategories' => $this->resource['subcategories'],
            'sort_options' => [
                'recommended' => 'Recommended',
                'newest' => 'Newest',
                'lowest_price' => 'Lowest Price',
                'highest_price' => 'Highest Price',
            ],
            'unavailable_sort_options' => [
                'best_rated' => 'Best Rated — coming soon',
                'most_reviewed' => 'Most Reviewed — coming soon',
                'most_booked' => 'Most Booked — coming soon',
            ],
            'unavailable_filters' => [
                'rating' => 'Ratings coming soon',
                'agent_level' => 'Agent levels coming soon',
            ],
        ];
    }
}