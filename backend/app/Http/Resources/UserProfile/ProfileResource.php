<?php
// app/Http/Resources/UserProfile/ProfileResource.php

namespace App\Http\Resources\UserProfile;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'uuid' => $this->uuid,
            'name' => $this->user?->name,
            'username' => $this->user?->username,
            // 'display_name' => $this->display_name,
            'photo_url' => $this->photo_path ? url("/api/user-profile/photo/{$this->uuid}") : null,
            'bio' => $this->bio,
            'phone' => $this->phone,
            'date_of_birth' => $this->date_of_birth?->toDateString(),
            'address_line' => $this->address_line,
            'city' => $this->city,
            'country' => $this->country,
            'languages' => $this->languages ?? [],
            'member_since' => $this->user?->created_at?->toIso8601String(),
            'account_status' => $this->user?->roles->pluck('name')->first(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}