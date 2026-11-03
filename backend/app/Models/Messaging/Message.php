<?php
// app/Models/Messaging/Message.php

namespace App\Models\Messaging;

use App\Enums\Messaging\MessageType;
use App\Models\Auth\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Message extends Model
{
    use HasUuids;

    protected $fillable = [
        'uuid',
        'conversation_id',
        'sender_id',
        'type',
        'body',
        'meta',
        'read_at',
    ];

    protected function casts(): array
    {
        return [
            'type' => MessageType::class,
            'meta' => 'array',
            'read_at' => 'datetime',
        ];
    }

    public function uniqueIds(): array { return ['uuid']; }

    public function conversation(): BelongsTo { return $this->belongsTo(Conversation::class); }
    public function sender(): BelongsTo { return $this->belongsTo(User::class, 'sender_id'); }
}