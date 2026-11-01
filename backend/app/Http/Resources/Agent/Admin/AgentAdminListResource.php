<?php
// app/Http/Resources/Agent/Admin/AgentAdminListResource.php

namespace App\Http\Resources\Agent\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AgentAdminListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'uuid' => $this->uuid,
            'agency' => $this->profile?->agency_name,
            'owner' => $this->user?->name,
            'owner_email' => $this->user?->email,
            'attempt' => $this->attempt,
            'status' => $this->status?->value,
            'submitted_at' => $this->submitted_at?->toIso8601String(),
        ];
    }
}