<?php
// app/Http/Resources/TravelService/TravelServiceDetailResource.php

namespace App\Http\Resources\TravelService;

use App\Services\Currency\CurrencyService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TravelServiceDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $targetCurrency = strtoupper((string) $request->query('currency', 'USD'));
        if (! in_array($targetCurrency, CurrencyService::SUPPORTED, true)) {
            $targetCurrency = 'USD';
        }
        $currency = app(CurrencyService::class);

        return [
            'uuid' => $this->uuid,
            'slug' => $this->slug,
            'title' => $this->title,
            'short_description' => $this->short_description,
            'full_description' => $this->full_description,
            'price' => (float) $this->price,
            'currency' => 'USD',
            'converted_price' => $currency->convert((float) $this->price, 'USD', $targetCurrency),
            'converted_currency' => $targetCurrency,
            'destination_country' => $this->destination_country,
            'destination_city' => $this->destination_city,
            'duration' => $this->duration,
            'duration_unit' => $this->duration_unit,
            'cancellation_policy' => $this->cancellation_policy,
            'status' => $this->status?->value,
            'category' => $this->whenLoaded('category', fn () => [
                'id' => $this->category->id, 'name' => $this->category->name,
                'milestone_model' => $this->category->milestone_model,
            ]),
            'subcategory' => $this->whenLoaded('subcategory', fn () => [
                'id' => $this->subcategory->id, 'name' => $this->subcategory->name,
            ]),
            'agent' => $this->whenLoaded('agent', fn () => [
                'uuid' => $this->agent->uuid,
                'agency_name' => $this->agent->profile?->agency_name,
                'country' => $this->agent->profile?->agency_country,
                'city' => $this->agent->profile?->agency_city,
            ]),
            'tags' => $this->whenLoaded('tags', fn () => $this->tags->pluck('tag')->values()->all()),
            'inclusions' => $this->whenLoaded('inclusions', fn () => $this->inclusions->map(fn ($i) => $i->label)->values()->all()),
            'extras' => $this->whenLoaded('extras', fn () => $this->extras->map(fn ($e) => [
                'uuid' => $e->uuid,
                'label' => $e->label,
                'price' => (float) $e->price,
                'currency' => 'USD',
                'converted_price' => $currency->convert((float) $e->price, 'USD', $targetCurrency),
                'converted_currency' => $targetCurrency,
                'description' => $e->description,
            ])->values()->all()),
            'images' => $this->whenLoaded('images', fn () => $this->images->map(fn ($img) => [
                'uuid' => $img->uuid,
                'url' => url("/api/services/images/{$img->uuid}"),
                'is_cover' => (bool) $img->is_cover,
            ])->values()->all()),
            'requirements' => $this->whenLoaded('requirements', fn () => $this->requirements->map(fn ($r) => [
                'uuid' => $r->uuid,
                'title' => $r->title,
                'description' => $r->description,
                'answer_type' => $r->answer_type?->value,
            ])->values()->all()),
            'rating' => null,
            'reviews_count' => null,
        ];
    }
}