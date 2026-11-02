<?php
// app/Http/Resources/TravelService/Admin/ServiceAdminListResource.php

namespace App\Http\Resources\TravelService\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ServiceAdminListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'uuid' => $this->uuid,
            'title' => $this->title,
            'agent' => $this->agent?->profile?->agency_name ?? $this->agent?->user?->name,
            'agent_uuid' => $this->agent?->uuid,
            'category' => $this->subcategory?->name ?? $this->category?->name,
            'price' => (float) $this->price,
            'currency' => 'USD',
            'status' => $this->status?->value,
            'attempt' => $this->attempt,
            'submitted_at' => $this->submitted_at?->toIso8601String(),
        ];
    }
}