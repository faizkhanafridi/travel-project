<?php
// app/Services/Auth/RegistrationService.php

namespace App\Services\Auth;

use App\Enums\Auth\UserRole;
use App\Mail\Auth\VerificationCodeMail;
use App\Models\Auth\User;
use App\Repositories\Contracts\Auth\PendingRegistrationRepositoryInterface;
use App\Repositories\Contracts\Auth\UserRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class RegistrationService
{
    public function __construct(
        private PendingRegistrationRepositoryInterface $pendingRepo,
        private UserRepositoryInterface $userRepo,
    ) {}

    public function register(string $name, string $email, string $plainPassword, ?string $ip): void
    {
        if ($this->userRepo->findByEmail($email)) {
            throw new UnprocessableEntityHttpException('This email cannot be registered.');
        }

        $this->issueCode($name, $email, $plainPassword, $ip);
    }

    public function resend(string $email): void
    {
        $pending = $this->pendingRepo->findByEmail($email);
        if (! $pending) {
            // generic success to avoid enumeration
            return;
        }

        if ($pending->last_sent_at && $pending->last_sent_at->diffInSeconds(now()) < (int) config('auth.resend_cooldown', 60)) {
            throw new UnprocessableEntityHttpException('Please wait before requesting a new code.');
        }

        $plain = $this->generateCode();
        $this->pendingRepo->upsert($email, [
            'code_hash' => Hash::make($plain),
            'expires_at' => now()->addMinutes((int) config('auth.code_ttl', 10)),
            'last_sent_at' => now(),
            'attempts' => 0,
        ]);

        Mail::to($email)->queue(new VerificationCodeMail($pending->name, $email, $plain));

    }

    public function verify(string $email, string $plainCode, ?string $ip): User
    {
        $pending = $this->pendingRepo->findByEmail($email);
        if (! $pending || $pending->isExpired()) {
            throw new UnprocessableEntityHttpException('Invalid or expired code.');
        }

        if ($pending->attempts >= 5) {
            $this->pendingRepo->delete($pending);
            throw new UnprocessableEntityHttpException('Too many attempts. Please register again.');
        }

        if (! Hash::check($plainCode, $pending->code_hash)) {
            $this->pendingRepo->incrementAttempts($pending);
            throw new UnprocessableEntityHttpException('Invalid or expired code.');
        }

        return DB::transaction(function () use ($pending, $ip) {
            $user = $this->userRepo->create([
                'name' => $pending->name,
                'email' => $pending->email,
                'password' => $pending->password, // already hashed
                'email_verified_at' => now(),
                'status' => \App\Enums\Auth\UserStatus::ACTIVE->value,
                'google_id' => null,
                'facebook_id' => null,
            ]);
            $this->userRepo->assignRole($user, UserRole::CUSTOMER->value);
            $this->pendingRepo->delete($pending);
            return $user;
        });
    }

    private function issueCode(string $name, string $email, string $plainPassword, ?string $ip): void
    {
        $plain = $this->generateCode();
        $this->pendingRepo->upsert($email, [
            'name' => $name,
            'password' => Hash::make($plainPassword),
            'code_hash' => Hash::make($plain),
            'expires_at' => now()->addMinutes((int) config('auth.code_ttl', 10)),
            'last_sent_at' => now(),
            'attempts' => 0,
            'registered_from_ip' => $ip,
        ]);
        Mail::to($email)->queue(new VerificationCodeMail($name, $email, $plain));

    }

    private function generateCode(): string
    {
        return str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }
}