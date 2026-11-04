<?php
// app/Http/Resources/TravelPost/TravelPostListResource.php

namespace App\Http\Resources\TravelPost;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TravelPostListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'uuid' => $this->uuid,
            'type' => $this->type?->value,
            'status' => $this->status?->value,
            'title' => $this->title,
            'description' => mb_substr($this->description, 0, 240),
            'category' => $this->category?->name,
            'subcategory' => $this->subcategory?->name,
            'destination_country' => $this->destination_country,
            'destination_city' => $this->destination_city,
            'duration' => $this->duration,
            'duration_unit' => $this->duration_unit,
            'travelers_total' => $this->travelers_total,
            'budget_min' => (float) $this->budget_min,
            'budget_max' => (float) $this->budget_max,
            'currency' => $this->currency,
            'customer' => $this->customer ? [
                'uuid' => $this->customer->uuid,
                'name' => $this->customer->name,
            ] : null,
            'offers_count' => $this->whenLoaded('offers', fn () => $this->offers->count()),
            'created_at' => $this->created_at?->toIso8601String(),
            'travel_date' => $this->travel_date?->toDateString(),
            'preferred_date' => $this->preferred_date?->toDateString(),
        ];
    }
}