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

    public function sendResetLink(string $email): void
    {
        $user = $this->userRepo->findByEmail($email);

        // Always generic; never reveal whether the email exists.
        if (! $user || ! $user->hasPassword()) {
            return;
        }

        $plainToken = Str::random(64);
        $hashedToken = Hash::make($plainToken);
        $ttl = (int) config('auth.password_reset_ttl_minutes', 60) ?: 60;

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $email],
            [
                'token' => $hashedToken,
                'created_at' => now(),
            ],
        );

        // The plain token is emailed to the user; only the hash is stored.
        SendPasswordResetJob::dispatch($email, $plainToken, $ttl);
    }

    public function reset(string $email, string $plainToken, string $newPassword): void
    {
        $user = $this->userRepo->findByEmail($email);

        $record = DB::table('password_reset_tokens')->where('email', $email)->first();

        if (! $user || ! $record || ! Hash::check($plainToken, $record->token)) {
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
}