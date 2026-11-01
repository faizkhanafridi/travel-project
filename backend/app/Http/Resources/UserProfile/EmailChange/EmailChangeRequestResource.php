<?php
// app/Http/Resources/UserProfile/EmailChange/EmailChangeRequestResource.php

namespace App\Http\Resources\UserProfile\EmailChange;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmailChangeRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'uuid' => $this->uuid,
            'new_email' => $this->new_email,
            'stage' => $this->stage?->value,
            'expires_at' => $this->stage?->value === 'CURRENT_EMAIL_VERIFY'
                ? $this->current_email_expires_at?->toIso8601String()
                : $this->new_email_expires_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}