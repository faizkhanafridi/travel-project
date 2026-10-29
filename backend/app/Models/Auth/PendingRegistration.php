<?php

namespace App\Models\Auth;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class PendingRegistration extends Model
{
    protected $fillable = [
        'uuid',
        'email',
        'password',
        'verification_code',
        'attempts',
        'expires_at',
        'last_sent_at',
        'ip_address',
    ];

    protected $hidden = [
        'password',
        'verification_code',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'last_sent_at' => 'datetime',
        'attempts' => 'integer',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $model) {
            $model->uuid ??= (string) Str::uuid();
        });
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function hasExceededAttempts(int $max): bool
    {
        return $this->attempts >= $max;
    }

    public function canResend(int $cooldownSeconds): bool
    {
        return $this->last_sent_at->addSeconds($cooldownSeconds)->isPast();
    }
}