<?php

namespace App\Models\Agent;

use App\Enums\Agent\AgentStatus;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class Agent extends Model
{
    protected $fillable = [
        'uuid',
        'user_id',
        'status',
        'current_attempt',
        'submitted_at',
        'approved_at',
        'rejected_at',
    ];

    protected $casts = [
        'status' => AgentStatus::class,
        'submitted_at' => 'datetime',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
        'current_attempt' => 'integer',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $agent) {
            $agent->uuid ??= (string) Str::uuid();
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function profile(): HasOne
    {
        return $this->hasOne(AgentProfile::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(AgentDocument::class);
    }

    public function businessHours(): HasMany
    {
        return $this->hasMany(AgentBusinessHour::class)->orderBy('day_of_week');
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(AgentApplicationAttempt::class)->orderBy('attempt_number');
    }

    public function events(): HasMany
    {
        return $this->hasMany(AgentApplicationEvent::class)->latest();
    }

    public function isEditable(): bool
    {
        return in_array($this->status, [
            AgentStatus::DRAFT,
            AgentStatus::REJECTED,
        ], true);
    }

    public function isApproved(): bool
    {
        return $this->status === AgentStatus::APPROVED;
    }

    public function isLocked(): bool
    {
        return in_array($this->status, [
            AgentStatus::PENDING_REVIEW,
            AgentStatus::UNDER_REVIEW,
            AgentStatus::SUSPENDED,
        ], true);
    }
}