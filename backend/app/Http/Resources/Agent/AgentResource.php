<?php

namespace App\Http\Resources\Agent;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AgentResource extends JsonResource
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
            'profile' => new AgentProfileResource($this->whenLoaded('profile')),
            'documents' => AgentDocumentResource::collection($this->whenLoaded('documents')),
            'business_hours' => AgentBusinessHourResource::collection($this->whenLoaded('businessHours')),
            'attempts' => AgentAttemptResource::collection($this->whenLoaded('attempts')),
            'latest_attempt' => $this->whenLoaded('attempts', function () {
                $latest = $this->attempts->sortByDesc('attempt_number')->first();
                return $latest ? new AgentAttemptResource($latest) : null;
            }),
            'latest_rejection_reason' => $this->when(
                $this->status?->value === 'rejected',
                function () {
                    $latest = $this->attempts->sortByDesc('attempt_number')->first();
                    return $latest?->rejection_reason;
                },
            ),
        ];
    }
}