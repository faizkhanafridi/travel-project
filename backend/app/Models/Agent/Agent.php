<?php
// app/Models/Agent/Agent.php

namespace App\Models\Agent;

use App\Enums\Agent\AgentStatus;
use App\Models\Auth\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Agent extends Model
{
    use HasUuids;

    protected $fillable = [
        'uuid',
        'user_id',
        'status',
        'attempt',
        'submitted_at',
        'reviewed_at',
        'reviewed_by',
        'rejection_reason',
        'approved_at',
        'step_agency_saved',
        'step_business_saved',
        'step_documents_saved',
        'step_hours_saved',
        'connects_balance',
        'connects_awarded',
    ];

    protected function casts(): array
    {
        return [
            'status' => AgentStatus::class,
            'submitted_at' => 'datetime',
            'reviewed_at' => 'datetime',
            'approved_at' => 'datetime',
            'step_agency_saved' => 'boolean',
            'step_business_saved' => 'boolean',
            'step_documents_saved' => 'boolean',
            'step_hours_saved' => 'boolean',
            'connects_awarded' => 'boolean',
        ];
    }

    public function uniqueIds(): array
    {
        return ['uuid'];
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
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
        return $this->hasMany(AgentBusinessHour::class);
    }

    public function submissionHistory(): HasMany
    {
        return $this->hasMany(AgentSubmissionHistory::class);
    }

    public function isApproved(): bool
    {
        return $this->status === AgentStatus::APPROVED;
    }

    public function isLocked(): bool
    {
        // documents locked after approval
        return $this->status === AgentStatus::APPROVED;
    }
}