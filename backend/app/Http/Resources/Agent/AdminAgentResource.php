<?php

namespace App\Http\Resources\Agent;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminAgentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'uuid' => $this->uuid,
            'status' => $this->status?->value ?? $this->status,
            'current_attempt' => (int) $this->current_attempt,
            'submitted_at' => $this->submitted_at?->toIso8601String(),
            'approved_at' => $this->approved_at?->toIso8601String(),
            'rejected_at' => $this->rejected_at?->toIso8601String(),
            'agency_name' => $this->profile?->agency_name,
            'agency_owner_name' => $this->profile?->agency_owner_name,
            'owner' => [
                'uuid' => $this->user?->uuid,
                'email' => $this->user?->email,
            ],
            'latest_attempt' => $this->whenLoaded('attempts', function () {
                $latest = $this->attempts->sortByDesc('attempt_number')->first();
                return $latest ? [
                    'attempt_number' => (int) $latest->attempt_number,
                    'status' => $latest->status,
                    'submitted_at' => $latest->submitted_at?->toIso8601String(),
                    'rejection_reason' => $latest->rejection_reason,
                ] : null;
            }),
            'profile' => new AgentProfileResource($this->whenLoaded('profile')),
            'documents' => AgentDocumentResource::collection($this->whenLoaded('documents')),
            'business_hours' => AgentBusinessHourResource::collection($this->whenLoaded('businessHours')),
            'attempts' => AgentAttemptResource::collection($this->whenLoaded('attempts')),
            'events' => AgentEventResource::collection($this->whenLoaded('events')),
        ];
    }
}