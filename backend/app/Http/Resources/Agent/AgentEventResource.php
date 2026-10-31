<?php

namespace App\Http\Resources\Agent;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AgentEventResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'uuid' => $this->uuid,
            'event' => $this->event,
            'note' => $this->note,
            'meta' => $this->meta,
            'actor' => $this->whenLoaded('actor', fn () => $this->actor ? [
                'uuid' => $this->actor->uuid,
                'email' => $this->actor->email,
            ] : null),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}