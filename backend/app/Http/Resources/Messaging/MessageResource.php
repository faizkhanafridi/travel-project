<?php
// app/Http/Resources/Messaging/MessageResource.php

namespace App\Http\Resources\Messaging;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'uuid' => $this->uuid,
            'type' => $this->type?->value,
            'body' => $this->body,
            'meta' => $this->meta,
            'sender' => [
                'id' => $this->sender_id,
                'name' => $this->sender?->name,
            ],
            'read_at' => $this->read_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}