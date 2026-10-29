<?php

namespace App\Http\Resources\Auth;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'uuid' => $this->uuid,
            'email' => $this->email,
            'email_verified_at' => $this->email_verified_at?->toIso8601String(),
            'account_type' => $this->account_type?->value ?? $this->account_type,
            'onboarding_completed' => (bool) $this->onboarding_completed,
            'roles' => $this->getRoleNames(),
            'has_password' => $this->hasPassword(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}