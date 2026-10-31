<?php

namespace App\Models\Agent;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class AgentApplicationEvent extends Model
{
    protected $fillable = [
        'uuid',
        'agent_id',
        'attempt_id',
        'event',
        'actor_id',
        'note',
        'meta',
    ];

    protected $casts = [
        'meta' => 'array',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $e) {
            $e->uuid ??= (string) Str::uuid();
        });
    }

    public function agent(): BelongsTo
    {
        return $this->belongsTo(Agent::class);
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}