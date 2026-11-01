<?php
// app/Models/UserProfile/EmailChange/EmailChangeRequest.php

namespace App\Models\UserProfile\EmailChange;

use App\Enums\UserProfile\EmailChangeStage;
use App\Models\Auth\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmailChangeRequest extends Model
{
    use HasUuids;

    protected $table = 'email_change_requests';

    protected $fillable = [
        'uuid',
        'user_id',
        'new_email',
        'current_email_code_hash',
        'new_email_code_hash',
        'password_verified',
        'stage',
        'current_email_attempts',
        'new_email_attempts',
        'current_email_expires_at',
        'new_email_expires_at',
        'last_sent_at',
    ];

    protected $hidden = [
        'current_email_code_hash',
        'new_email_code_hash',
    ];

    protected function casts(): array
    {
        return [
            'password_verified' => 'boolean',
            'stage' => EmailChangeStage::class,
            'current_email_expires_at' => 'datetime',
            'new_email_expires_at' => 'datetime',
            'last_sent_at' => 'datetime',
        ];
    }

    // Override: only the uuid column is auto-generated
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

    public function isExpired(): bool
    {
        return match ($this->stage) {
            EmailChangeStage::CURRENT_EMAIL_VERIFY => $this->current_email_expires_at?->isPast() ?? true,
            EmailChangeStage::NEW_EMAIL_VERIFY => $this->new_email_expires_at?->isPast() ?? true,
        };
    }
}