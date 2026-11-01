<?php
// app/Services/Auth/PasswordResetService.php

namespace App\Services\Auth;

use App\Mail\Auth\PasswordResetCodeMail;
use App\Mail\Auth\SetPasswordCodeMail;
use App\Models\Auth\User;
use App\Repositories\Contracts\Auth\PasswordResetCodeRepositoryInterface;
use App\Repositories\Contracts\Auth\UserRepositoryInterface;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class PasswordResetService
{
    public function __construct(
        private PasswordResetCodeRepositoryInterface $codeRepo,
        private UserRepositoryInterface $userRepo,
    ) {}

    public function sendCode(string $email): string
    {
        $user = $this->userRepo->findByEmail($email);
        if (! $user) {
            // generic response to avoid enumeration
                    return 'unknown';

        }

        $existing = $this->codeRepo->findByEmail($email);
        if ($existing && $existing->last_sent_at && $existing->last_sent_at->diffInSeconds(now()) < 60) {
            throw new UnprocessableEntityHttpException('Please wait before requesting a new code.');
        }

        $plain = $this->generateCode();
        $this->codeRepo->upsert($email, [
            'code_hash' => Hash::make($plain),
            'expires_at' => now()->addMinutes((int) config('auth.code_ttl', 10)),
            'last_sent_at' => now(),
            'attempts' => 0,
        ]);

        // Social-only users have no password yet — send a "set password" email
        // instead of a "reset password" email. Both flows reuse the same code table.
        if ($user->password === null) {
            Mail::to($email)->queue(new SetPasswordCodeMail($user->name, $email, $plain));
               return 'set';
        }

        Mail::to($email)->queue(new PasswordResetCodeMail($user->name, $email, $plain));
               return 'reset';

    }

    public function reset(string $email, string $plainCode, string $newPassword): void
    {
        $user = $this->consumeCode($email, $plainCode);

        if ($user->password === null) {
            // Defensive: reset endpoint must not be used for social-only users.
            // They should use set-password. Still allow it here as a safety net.
            $this->userRepo->updatePassword($user, Hash::make($newPassword));
            $this->userRepo->invalidateSessions($user);
            return;
        }

        $this->userRepo->updatePassword($user, Hash::make($newPassword));
        $this->userRepo->invalidateSessions($user);
    }

    public function setPassword(string $email, string $plainCode, string $newPassword): void
    {
        $user = $this->consumeCode($email, $plainCode);

        if ($user->password !== null) {
            // Defensive: once a password exists, only reset/change-password may be used.
            throw new UnprocessableEntityHttpException('A password is already set for this account.');
        }

        $this->userRepo->updatePassword($user, Hash::make($newPassword));
        $this->userRepo->invalidateSessions($user);
    }

    public function changePassword(User $user, string $currentPassword, string $newPassword): void
    {
        if (! $user->password || ! Hash::check($currentPassword, $user->password)) {
            throw new UnprocessableEntityHttpException('Current password is incorrect.');
        }
        $this->userRepo->updatePassword($user, Hash::make($newPassword));
        // invalidate other sessions
        $this->userRepo->invalidateSessions($user, request()->session()->getId());
    }

    /**
     * Verifies and consumes a password reset / set-password code, returning the user.
     * Shared by reset() and setPassword().
     */
    private function consumeCode(string $email, string $plainCode): User
    {
        $record = $this->codeRepo->findByEmail($email);
        if (! $record || $record->isExpired()) {
            throw new UnprocessableEntityHttpException('Invalid or expired code.');
        }
        if ($record->attempts >= 5) {
            $this->codeRepo->delete($record);
            throw new UnprocessableEntityHttpException('Too many attempts. Please request a new code.');
        }
        if (! Hash::check($plainCode, $record->code_hash)) {
            $this->codeRepo->incrementAttempts($record);
            throw new UnprocessableEntityHttpException('Invalid or expired code.');
        }

        $user = $this->userRepo->findByEmail($email);
        if (! $user) {
            throw new UnprocessableEntityHttpException('Unable to complete the request.');
        }

        $this->codeRepo->delete($record);

        return $user;
    }

    private function generateCode(): string
    {
        return str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }
}