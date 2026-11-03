<?php
// app/Http/Resources/TravelService/TravelServiceWizardResource.php

namespace App\Http\Resources\TravelService;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TravelServiceWizardResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'uuid' => $this->uuid,
            'title' => $this->title,
            'slug' => $this->slug,
            'status' => $this->status?->value,
            'attempt' => $this->attempt,
            'submitted_at' => $this->submitted_at?->toIso8601String(),
            'published_at' => $this->published_at?->toIso8601String(),
            'rejection_reason' => $this->rejection_reason,
            'suspended_at' => $this->suspended_at?->toIso8601String(),
            'steps' => [
                'basic' => (bool) $this->step_basic_saved,
                'details' => (bool) $this->step_details_saved,
                'gallery' => (bool) $this->step_gallery_saved,
                'requirements' => (bool) $this->step_requirements_saved,
            ],
            'category_id' => $this->category_id,
            'subcategory_id' => $this->subcategory_id,
            'short_description' => $this->short_description,
            'full_description' => $this->full_description,
            'price' => (float) $this->price,
            'currency' => 'USD',
            'destination_country' => $this->destination_country,
            'destination_city' => $this->destination_city,
            'duration' => $this->duration,
            'duration_unit' => $this->duration_unit,
            'cancellation_policy' => $this->cancellation_policy,
            'tags' => $this->whenLoaded('tags', fn() => $this->tags->pluck('tag')->values()->all()),
            'inclusions' => $this->whenLoaded('inclusions', fn() => $this->inclusions->pluck('label')->values()->all()),
            'extras' => $this->whenLoaded('extras', fn() => $this->extras->map(fn($e) => [
                'uuid' => $e->uuid,
                'label' => $e->label,
                'price' => (float) $e->price,
                'description' => $e->description,
            ])->values()->all()),
            'images' => $this->whenLoaded('images', fn() => $this->images->map(fn($img) => [
                'uuid' => $img->uuid,
                'url' => url("/api/services/images/{$img->uuid}"),
                'is_cover' => (bool) $img->is_cover,
            ])->values()->all()),
            'requirements' => $this->whenLoaded('requirements', fn() => $this->requirements->map(fn($r) => [
                'uuid' => $r->uuid,
                'title' => $r->title,
                'description' => $r->description,
                'answer_type' => $r->answer_type?->value,
                'validation_config' => $r->validation_config,
            ])->values()->all()),
            'latest_republish_request' => $this->whenLoaded('republishRequests', function () {
                $latest = $this->republishRequests->first();
                if (! $latest) return null;
                return [
                    'uuid' => $latest->uuid,
                    'status' => $latest->status?->value,
                    'reason' => $latest->reason,
                    'rejection_reason' => $latest->rejection_reason,
                    'created_at' => $latest->created_at?->toIso8601String(),
                ];
            }),
            'agent' => $this->whenLoaded('agent', fn() => [
                'uuid' => $this->agent->uuid,
                'agency_name' => $this->agent->profile?->agency_name,
                'owner_name' => $this->agent->user?->name,
            ]),
        ];
    }
}
