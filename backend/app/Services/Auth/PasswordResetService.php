<?php

namespace App\Services\Auth;

use App\Jobs\Auth\SendPasswordResetJob;
use App\Repositories\Contracts\Auth\UserRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PasswordResetService
{
    public function __construct(
        private UserRepositoryInterface $userRepo,
    ) {}

    // public function sendResetLink(string $email): void
    // {
    //     $user = $this->userRepo->findByEmail($email);

    //     // Always generic; never reveal whether the email exists.
    //     if (! $user || ! $user->hasPassword()) {
    //         return;
    //     }

    //     $plainToken = Str::random(64);
    //     $hashedToken = Hash::make($plainToken);
    //     $ttl = (int) config('auth.password_reset_ttl_minutes', 60) ?: 60;

    //     DB::table('password_reset_tokens')->updateOrInsert(
    //         ['email' => $email],
    //         [
    //             'token' => $hashedToken,
    //             'created_at' => now(),
    //         ],
    //     );

    //     // The plain token is emailed to the user; only the hash is stored.
    //     sendPasswordResetJob::dispatch($email, $plainToken, $ttl);

    // }

    public function reset(string $email, string $plainToken, string $newPassword): void
    {
        $user = $this->userRepo->findByEmail($email);

        $record = DB::table('password_reset_tokens')->where('email', $email)->first();

        // if (! $user || ! $record || ! Hash::check($plainToken, $record->token)) {
        //     throw ValidationException::withMessages([
        //         'token' => ['This password reset token is invalid.'],
        //     ]);
        // }
     if (! $user || ! $record || ($record->purpose ?? 'reset') !== 'reset' || ! Hash::check($plainToken, $record->token)) {
    throw ValidationException::withMessages([
        'token' => ['This password reset token is invalid.'],
    ]);
}

        $ttl = (int) config('auth.password_reset_ttl_minutes', 60) ?: 60;

        if (now()->diffInMinutes($record->created_at) > $ttl) {
            DB::table('password_reset_tokens')->where('email', $email)->delete();
            throw ValidationException::withMessages([
                'token' => ['This password reset token has expired.'],
            ]);
        }

        DB::transaction(function () use ($user, $email, $newPassword) {
            $this->userRepo->updatePassword($user, Hash::make($newPassword));
            DB::table('password_reset_tokens')->where('email', $email)->delete();
            // Invalidate sessions/tokens on password change.
            $user->tokens()->delete();
        });
    }

    // Public endpoint — forgot-password form. Decides reset vs. set by user state.
public function sendResetOrSetLink(string $email): void
{
    $user = $this->userRepo->findByEmail($email);

    // Generic behavior — never leak whether the email is registered.
    if (! $user) {
        return;
    }

    if ($user->hasPassword()) {
        $this->dispatchResetLink($email);
    } else {
        $this->dispatchSetLink($email);
    }
}

// Reuse for existing users with a password.
private function dispatchResetLink(string $email): void
{
    $plainToken = \Illuminate\Support\Str::random(64);
    $hashedToken = \Illuminate\Support\Facades\Hash::make($plainToken);
    $ttl = (int) config('auth.password_reset_ttl_minutes', 60) ?: 60;

    \Illuminate\Support\Facades\DB::table('password_reset_tokens')->updateOrInsert(
        ['email' => $email],
        ['token' => $hashedToken, 'purpose' => 'reset', 'created_at' => now()],
    );

    \App\Jobs\Auth\SendPasswordResetJob::dispatch($email, $plainToken, $ttl);
}

// Social-only users — send a "set password" link.
private function dispatchSetLink(string $email): void
{
    $plainToken = \Illuminate\Support\Str::random(64);
    $hashedToken = \Illuminate\Support\Facades\Hash::make($plainToken);
    $ttl = (int) config('auth.password_reset_ttl_minutes', 60) ?: 60;

    \Illuminate\Support\Facades\DB::table('password_reset_tokens')->updateOrInsert(
        ['email' => $email],
        ['token' => $hashedToken, 'purpose' => 'set', 'created_at' => now()],
    );

    \App\Jobs\Auth\SendSetPasswordJob::dispatch($email, $plainToken, $ttl);
}

// New public method: social-only user submits a set-password token from email.
public function setPasswordWithToken(string $email, string $plainToken, string $newPassword): void
{
    $user = $this->userRepo->findByEmail($email);

    $record = \Illuminate\Support\Facades\DB::table('password_reset_tokens')
        ->where('email', $email)
        ->first();

    if (! $user || ! $record || ! \Illuminate\Support\Facades\Hash::check($plainToken, $record->token)) {
        throw \Illuminate\Validation\ValidationException::withMessages([
            'token' => ['This password-set token is invalid.'],
        ]);
    }

    if ($record->purpose !== 'set') {
        throw \Illuminate\Validation\ValidationException::withMessages([
            'token' => ['This token is not valid for setting a password.'],
        ]);
    }

    // If they somehow already have a password (race), refuse.
    if ($user->hasPassword()) {
        throw \Illuminate\Validation\ValidationException::withMessages([
            'email' => ['This account already has a password. Use forgot-password instead.'],
        ]);
    }

    $ttl = (int) config('auth.password_reset_ttl_minutes', 60) ?: 60;

    if (now()->diffInMinutes($record->created_at) > $ttl) {
        \Illuminate\Support\Facades\DB::table('password_reset_tokens')->where('email', $email)->delete();
        throw \Illuminate\Validation\ValidationException::withMessages([
            'token' => ['This password-set token has expired.'],
        ]);
    }

    \Illuminate\Support\Facades\DB::transaction(function () use ($user, $email, $newPassword) {
        $this->userRepo->updatePassword($user, \Illuminate\Support\Facades\Hash::make($newPassword));
        \Illuminate\Support\Facades\DB::table('password_reset_tokens')->where('email', $email)->delete();
        $user->tokens()->delete();
    });
}
}