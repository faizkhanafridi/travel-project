<?php
// app/Http/Resources/Auth/AuthUserResource.php

namespace App\Http\Resources\Auth;

use App\Enums\Agent\AgentStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuthUserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'uuid' => $this->uuid,
            'agent_uuid' => $this->agent?->status === AgentStatus::APPROVED
                ? $this->agent->uuid
                : null,
            'name' => $this->name,
            'username' => $this->username,
            'email' => $this->email,
            'email_verified' => (bool) $this->email_verified_at,
            'status' => $this->status?->value,
            'roles' => $this->getRoleNames(),
            'onboarding_completed' => $this->hasCompletedOnboarding(),
            'onboarding_choice' => $this->onboarding_choice?->value,
            'has_mfa' => $this->hasMfaEnabled(),
            'has_password' => $this->password !== null,
            'is_customer' => $this->hasRole('customer'),
            'is_agent' => $this->hasRole('agent'),
            'is_super_admin' => $this->hasRole('super_admin'),
        ];
    }
}
