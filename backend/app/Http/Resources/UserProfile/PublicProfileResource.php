<?php
// app/Http/Resources/UserProfile/PublicProfileResource.php

namespace App\Http\Resources\UserProfile;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PublicProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'uuid' => $this->uuid,
            'name' => $this->user?->name,
            'username' => $this->user?->username,
            // 'display_name' => $this->display_name,
            'agent_uuid' => $this->user?->agent?->status === \App\Enums\Agent\AgentStatus::APPROVED
                ? $this->user->agent->uuid
                : null,
            'photo_url' => $this->photo_path ? url("/api/user-profile/photo/{$this->uuid}") : null,
            'bio' => $this->bio,
            'city' => $this->city,
            'country' => $this->country,
            'languages' => $this->languages ?? [],
            'member_since' => $this->user?->created_at?->toIso8601String(),
            // 'account_status' => $this->user?->roles->pluck('name')->first(),
            'account_status' => $this->user?->hasRole('agent') ? 'agent' : 'customer',
        ];
    }
}
