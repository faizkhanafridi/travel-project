<?php
// app/Models/Auth/User.php

namespace App\Models\Auth;

use App\Enums\Auth\OnboardingChoice;
use App\Enums\Auth\UserStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles, SoftDeletes;

    protected $fillable = [
        'uuid',
        'name',
        'username',
        'email',
        'password',
        'google_id',
        'facebook_id',
        'status',
        'onboarding_completed_at',
        'onboarding_choice',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'two_factor_confirmed_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'onboarding_completed_at' => 'datetime',
            'two_factor_confirmed_at' => 'datetime',
            'password' => 'hashed',
            'status' => UserStatus::class,
            'onboarding_choice' => OnboardingChoice::class,
            'two_factor_secret' => 'encrypted',
        ];
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    public function hasCompletedOnboarding(): bool
    {
        return $this->onboarding_completed_at !== null;
    }

    public function hasMfaEnabled(): bool
    {
        return $this->two_factor_confirmed_at !== null;
    }
}