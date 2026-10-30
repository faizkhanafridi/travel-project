<?php

namespace App\Http\Resources\UserProfile;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PublicUserProfileResource extends JsonResource
{
    // Only ever used for customers — never exposes email, phone, DOB, or address.
    public function toArray(Request $request): array
    {
        return [
            'username' => $this->username,
            'display_name' => $this->display_name,
            'profile_photo_url' => $this->profile_photo_url,
            'bio' => $this->bio,
            'member_since' => $this->user?->created_at?->toIso8601String(),
            'languages' => $this->whenLoaded('languages', fn () => $this->languages->pluck('name')),
        ];
    }
}