<?php
// app/Http/Resources/TravelService/TravelServiceCardResource.php

namespace App\Http\Resources\TravelService;

use App\Services\Currency\CurrencyService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TravelServiceCardResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $targetCurrency = strtoupper((string) $request->query('currency', 'USD'));
        if (! in_array($targetCurrency, CurrencyService::SUPPORTED, true)) {
            $targetCurrency = 'USD';
        }
        $converted = app(CurrencyService::class)->convert((float) $this->price, 'USD', $targetCurrency);

        return [
            'uuid' => $this->uuid,
            'slug' => $this->slug,
            'title' => $this->title,
            'short_description' => $this->short_description,
            'price' => (float) $this->price,
            'currency' => 'USD',
            'converted_price' => $converted,
            'converted_currency' => $targetCurrency,
            'duration' => $this->duration,
            'duration_unit' => $this->duration_unit,
            'destination_country' => $this->destination_country,
            'destination_city' => $this->destination_city,
            'category' => $this->whenLoaded('category', fn () => $this->category->name),
            'subcategory' => $this->whenLoaded('subcategory', fn () => $this->subcategory->name),
            'agency_name' => $this->agent?->profile?->agency_name,
            'agent_uuid' => $this->agent?->uuid,
            'cover_image_url' => $this->images->first()?->uuid
                ? url("/api/services/images/{$this->images->first()->uuid}")
                : null,
            'rating' => null,
            'reviews_count' => null,
        ];
    }
}