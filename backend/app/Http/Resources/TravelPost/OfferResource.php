<?php
// app/Http/Resources/TravelPost/OfferResource.php

namespace App\Http\Resources\TravelPost;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OfferResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'uuid' => $this->uuid,
            'amount' => (float) $this->amount,
            'currency' => $this->currency,
            'duration' => $this->duration,
            'duration_unit' => $this->duration_unit,
            'message' => $this->message,
            'inclusions' => $this->inclusions ?? [],
            'itinerary' => $this->itinerary,
            'status' => $this->status?->value,
            'connects_spent' => $this->connects_spent,
            'agent' => $this->agent ? [
                'uuid' => $this->agent->uuid,
                'agency_name' => $this->agent->profile?->agency_name,
                'owner_name' => $this->agent->user?->name,
                'country' => $this->agent->profile?->agency_country,
                'city' => $this->agent->profile?->agency_city,
            ] : null,
            'requirements' => $this->whenLoaded('requirements', fn() => $this->requirements->map(fn($r) => [
                'uuid' => $r->uuid,
                'title' => $r->title,
                'description' => $r->description,
                'answer_type' => $r->answer_type,
            ])->all()),
            'post' => $this->whenLoaded('post', fn() => [
                'uuid' => $this->post->uuid,
                'title' => $this->post->title,
                'status' => $this->post->status?->value,
            ]),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
