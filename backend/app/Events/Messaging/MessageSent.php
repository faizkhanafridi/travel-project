<?php
// app/Events/Messaging/MessageSent.php

namespace App\Events\Messaging;

use App\Models\Messaging\Message;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Message $message) {}

    public function broadcastOn(): array
    {
        return [new PrivateChannel('conversation.' . $this->message->conversation->uuid)];
    }

    public function broadcastAs(): string
    {
        return 'message.sent';
    }

    public function broadcastWith(): array
    {
        return [
            'uuid' => $this->message->uuid,
            'conversation_uuid' => $this->message->conversation->uuid,
            'sender' => [
                'id' => $this->message->sender_id,
                'name' => $this->message->sender?->name,
            ],
            'type' => $this->message->type?->value,
            'body' => $this->message->body,
            'meta' => $this->message->meta,
            'created_at' => $this->message->created_at?->toIso8601String(),
        ];
    }
}