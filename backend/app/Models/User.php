<?php

namespace App\Models;

use App\Enums\Auth\AccountType;
use App\Models\Auth\SocialAccount;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, HasRoles, Notifiable, SoftDeletes;

    protected $fillable = [
        'uuid',
        'email',
        'password',
        'account_type',
        'onboarding_completed',
        'email_verified_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'onboarding_completed' => 'boolean',
        'account_type' => AccountType::class,
    ];

    protected static function booted(): void
    {
        static::creating(function (self $user) {
            $user->uuid ??= (string) Str::uuid();
        });
    }

    // A user "has a password" only if it was set locally.
    public function hasPassword(): bool
    {
        return ! is_null($this->password);
    }

    public function socialAccounts()
    {
        return $this->hasMany(SocialAccount::class);
    }
}