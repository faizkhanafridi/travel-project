<?php

namespace App\Http\Resources\UserProfile;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LanguageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
                    'id'   => $this->id,   
            'uuid' => $this->uuid,
            'name' => $this->name,
            'code' => $this->code,
        ];
    }
}