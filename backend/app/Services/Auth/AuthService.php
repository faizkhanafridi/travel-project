<?php
// app/Services/Auth/AuthService.php

namespace App\Services\Auth;

use App\Enums\Auth\UserStatus;
use App\Models\Auth\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    /**
     * Attempt to log the user in.
     * @return array{user: User, requires_mfa: bool}
     */
    public function attempt(string $email, string $password, bool $remember = false): array
    {
        /** @var User|null $user */
        $user = User::where('email', $email)->first();

        if (! $user || ! $user->password || ! Hash::check($password, $user->password)) {
            // generic message (no enumeration)
            throw ValidationException::withMessages([
                'email' => ['These credentials do not match our records.'],
            ]);
        }

        if ($user->status !== UserStatus::ACTIVE) {
            throw ValidationException::withMessages([
                'email' => ['This account is not active.'],
            ]);
        }

        if ($user->hasMfaEnabled()) {
            // mark session as MFA-pending; do NOT call Auth::login yet
            session([
                '2fa:user_id' => $user->id,
                '2fa:remember' => $remember,
            ]);
            return ['user' => $user, 'requires_mfa' => true];
        }

        Auth::login($user, $remember);
        request()->session()->regenerate();

        return ['user' => $user, 'requires_mfa' => false];
    }

    public function logout(): void
    {
        Auth::guard('web')->logout();
        request()->session()->invalidate();
        request()->session()->regenerateToken();
    }
}