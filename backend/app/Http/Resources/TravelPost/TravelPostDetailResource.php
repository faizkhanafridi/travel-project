<?php
// app/Http/Resources/TravelPost/TravelPostDetailResource.php

namespace App\Http\Resources\TravelPost;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TravelPostDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'uuid' => $this->uuid,
            'type' => $this->type?->value,
            'status' => $this->status?->value,
            'title' => $this->title,
            'description' => $this->description,
            'milestone_model' => $this->milestone_model,
            'category' => $this->category ? [
                'id' => $this->category->id, 'name' => $this->category->name,
            ] : null,
            'subcategory' => $this->subcategory ? [
                'id' => $this->subcategory->id, 'name' => $this->subcategory->name,
            ] : null,
            'service' => $this->whenLoaded('service', fn () => [
                'uuid' => $this->service->uuid,
                'title' => $this->service->title,
            ]),
            'agent' => $this->whenLoaded('agent', fn () => [
                'uuid' => $this->agent->uuid,
                'agency_name' => $this->agent->profile?->agency_name,
            ]),
            'destination_country' => $this->destination_country,
            'destination_city' => $this->destination_city,
            'duration' => $this->duration,
            'duration_unit' => $this->duration_unit,
            'travel_date' => $this->travel_date?->toDateString(),
            'preferred_date' => $this->preferred_date?->toDateString(),
            'travelers' => [
                'total' => $this->travelers_total,
                'adults' => $this->travelers_adults,
                'children' => $this->travelers_children,
            ],
            'budget' => [
                'min' => (float) $this->budget_min,
                'max' => (float) $this->budget_max,
                'currency' => $this->currency,
            ],
            'services_needed' => $this->services_needed ?? [],
            'additional_requirements' => $this->additional_requirements,
            'offers' => OfferResource::collection($this->whenLoaded('offers')),
            'offers_count' => $this->whenLoaded('offers', fn () => $this->offers->count()),
            'customer' => $this->whenLoaded('customer', fn () => [
    'uuid' => $this->customer->uuid,
    'profile_uuid' => $this->customer->profile?->uuid,
    'name' => $this->customer->name,
]),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}