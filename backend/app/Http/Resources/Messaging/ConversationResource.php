<?php
// app/Http/Resources/Messaging/ConversationResource.php

namespace App\Http\Resources\Messaging;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConversationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();
        $isCustomer = $user && $this->customer_id === $user->id;

        $peer = $isCustomer
            ? [
                'role' => 'agent',
                'uuid' => $this->agentRecord?->uuid,
                'name' => $this->agentRecord?->user?->name,
                'agency_name' => $this->agentRecord?->profile?->agency_name,
                'photo_url' => null,
            ]
            : [
                'role' => 'customer',
                'uuid' => $this->customer?->profile?->uuid,
                'user_uuid' => $this->customer?->uuid,
                'name' => $this->customer?->name,
                'agency_name' => null,
                'photo_url' => null,
            ];

        $last = $this->lastMessage;

        return [
            'uuid' => $this->uuid,
            'peer' => $peer,
            'travel_service' => $this->travelService ? [
                'uuid' => $this->travelService->uuid,
                'title' => $this->travelService->title,
            ] : null,
            'last_message' => $last ? [
                'uuid' => $last->uuid,
                'preview' => mb_substr((string) $last->body, 0, 120),
                'sender_id' => $last->sender_id,
                'created_at' => $last->created_at?->toIso8601String(),
            ] : null,
            'last_message_at' => $this->last_message_at?->toIso8601String(),
            'unread_count' => 0, // filled by controller when needed
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
