<?php
// app/Models/Auth/PendingRegistration.php

namespace App\Models\Auth;

use Illuminate\Database\Eloquent\Model;

class PendingRegistration extends Model
{
    protected $fillable = [
        'email',
        'name',
        'password',
        'code_hash',
        'attempts',
        'expires_at',
        'last_sent_at',
        'registered_from_ip',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'last_sent_at' => 'datetime',
        ];
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }
}