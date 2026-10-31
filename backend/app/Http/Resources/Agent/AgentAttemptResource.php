<?php

namespace App\Http\Resources\Agent;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AgentAttemptResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'uuid' => $this->uuid,
            'attempt_number' => (int) $this->attempt_number,
            'status' => $this->status,
            'submitted_at' => $this->submitted_at?->toIso8601String(),
            'reviewed_at' => $this->reviewed_at?->toIso8601String(),
            'rejection_reason' => $this->when(
                $this->status === 'rejected',
                fn () => $this->rejection_reason,
            ),
        ];
    }
}