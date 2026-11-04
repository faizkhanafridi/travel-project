<?php
// app/Http/Resources/TravelPost/ConnectPackageResource.php

namespace App\Http\Resources\TravelPost;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConnectPackageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'uuid' => $this->uuid,
            'connects' => $this->connects,
            'price_usd' => (float) $this->price_usd,
        ];
    }
}