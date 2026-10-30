<?php

namespace App\Models\UserProfile;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class EmailChangeRequest extends Model
{
    protected $fillable = [
        'uuid',
        'user_id',
        'new_email',
        'method',
        'step',
        'current_email_code',
        'new_email_code',
        'current_email_attempts',
        'new_email_attempts',
        'current_email_expires_at',
        'new_email_expires_at',
        'last_sent_at',
    ];

    protected $hidden = [
        'current_email_code',
        'new_email_code',
    ];

    protected $casts = [
        'current_email_expires_at' => 'datetime',
        'new_email_expires_at' => 'datetime',
        'last_sent_at' => 'datetime',
        'current_email_attempts' => 'integer',
        'new_email_attempts' => 'integer',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $request) {
            $request->uuid ??= (string) Str::uuid();
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}