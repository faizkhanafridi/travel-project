<?php

namespace App\Http\Resources\UserProfile;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'uuid' => $this->uuid,
            'username' => $this->username,
            'display_name' => $this->display_name,
            'profile_photo_url' => $this->profile_photo_url,
            'bio' => $this->bio,
            'phone' => $this->phone,
            'date_of_birth' => $this->date_of_birth?->format('Y-m-d'),
            'address' => $this->address,
            'account_type' => $this->user?->account_type?->value ?? $this->user?->account_type,
            'member_since' => $this->user?->created_at?->toIso8601String(),
            'languages' => $this->whenLoaded('languages', fn () => $this->languages->map(fn ($l) => [
                'uuid' => $l->uuid,
                'name' => $l->name,
                'code' => $l->code,
            ])),
        ];
    }
}