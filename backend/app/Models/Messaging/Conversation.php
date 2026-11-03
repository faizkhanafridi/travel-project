<?php
// app/Models/Messaging/Conversation.php

namespace App\Models\Messaging;

use App\Models\Agent\Agent;
use App\Models\Auth\User;
use App\Models\TravelService\TravelService;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Conversation extends Model
{
    use HasUuids;

    protected $fillable = [
        'uuid',
        'type',
        'customer_id',
        'agent_id',
        'travel_service_id',
        'last_message_at',
    ];

    protected function casts(): array
    {
        return [
            'last_message_at' => 'datetime',
        ];
    }

    public function uniqueIds(): array { return ['uuid']; }
    public function getRouteKeyName(): string { return 'uuid'; }

    public function customer(): BelongsTo { return $this->belongsTo(User::class, 'customer_id'); }
    public function agentRecord(): BelongsTo { return $this->belongsTo(Agent::class, 'agent_id'); }
    public function travelService(): BelongsTo { return $this->belongsTo(TravelService::class); }
    public function participants(): HasMany { return $this->hasMany(ConversationParticipant::class); }
    public function messages(): HasMany { return $this->hasMany(Message::class); }
    public function lastMessage(): HasOne
    {
        return $this->hasOne(Message::class)->latestOfMany();
    }

    public function includesUser(int $userId): bool
    {
        return $this->customer_id === $userId
            || $this->agentRecord?->user_id === $userId;
    }

    public function isCustomer(int $userId): bool { return $this->customer_id === $userId; }
    public function isAgentUser(int $userId): bool
    {
        return $this->agentRecord?->user_id === $userId;
    }
}