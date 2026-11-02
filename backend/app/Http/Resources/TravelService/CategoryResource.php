<?php
// app/Http/Resources/TravelService/CategoryResource.php

namespace App\Http\Resources\TravelService;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'name' => $this->name,
            'slug' => $this->slug,
            'milestone_model' => $this->milestone_model,
            'subcategories' => self::collection($this->whenLoaded('children')),
        ];
    }
}