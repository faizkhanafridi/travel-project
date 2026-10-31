<?php

namespace App\Models\Agent;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class AgentApplicationAttempt extends Model
{
    protected $fillable = [
        'uuid',
        'agent_id',
        'attempt_number',
        'status',
        'submitted_at',
        'reviewed_at',
        'reviewed_by',
        'rejection_reason',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'reviewed_at' => 'datetime',
        'attempt_number' => 'integer',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $a) {
            $a->uuid ??= (string) Str::uuid();
        });
    }

    public function agent(): BelongsTo
    {
        return $this->belongsTo(Agent::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}