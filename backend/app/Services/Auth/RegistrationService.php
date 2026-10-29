<?php

namespace App\Services\Auth;

use App\Enums\Auth\AccountType;
use App\Enums\Auth\RoleName;
use App\Jobs\Auth\SendVerificationCodeJob;
use App\Models\Auth\PendingRegistration;
use App\Models\User;
use App\Repositories\Contracts\Auth\PendingRegistrationRepositoryInterface;
use App\Repositories\Contracts\Auth\UserRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class RegistrationService
{
    public function __construct(
        private PendingRegistrationRepositoryInterface $pendingRepo,
        private UserRepositoryInterface $userRepo,
        private VerificationCodeService $codeService,
    ) {}

    /**
     * Step 1 — Register: write to pending_registrations. No users row created.
     */
    public function register(string $email, string $plainPassword, ?string $ip): PendingRegistration
    {
        // If a verified user already exists, reject (generic message in controller).
        if ($this->userRepo->findByEmail($email)) {
            throw ValidationException::withMessages([
                'email' => ['An account with this email already exists.'],
            ]);
        }

        $code = $this->codeService->generate();
        $ttl = (int) config('auth.verification_code_ttl_minutes', 15) ?: 15;

        $existing = $this->pendingRepo->findByEmail($email);

        $payload = [
            'email' => $email,
            'password' => Hash::make($plainPassword),
            'verification_code' => $this->codeService->hash($code),
            'attempts' => 0,
            'expires_at' => now()->addMinutes($ttl),
            'last_sent_at' => now(),
            'ip_address' => $ip,
        ];

        $pending = $existing
            ? $this->pendingRepo->update($existing, $payload)
            : $this->pendingRepo->create($payload);

        // Queue the email (Redis queue). Never log the code.
        SendVerificationCodeJob::dispatch($pending->email, $code);

        return $pending;
    }

    /**
     * Step 2 — Verify email: atomically create the users row + assign role.
     */
    public function verifyEmail(string $email, string $code): User
    {
        $pending = $this->pendingRepo->findByEmail($email);

        if (! $pending) {
            throw ValidationException::withMessages([
                'email' => ['No pending registration found for this email.'],
            ]);
        }

        if ($pending->isExpired()) {
            $this->pendingRepo->delete($pending);
            throw ValidationException::withMessages([
                'code' => ['This verification code has expired. Please register again.'],
            ]);
        }

        $maxAttempts = (int) config('auth.verification_max_attempts', 5) ?: 5;

        if ($pending->hasExceededAttempts($maxAttempts)) {
            throw ValidationException::withMessages([
                'code' => ['Too many incorrect attempts. Please register again.'],
            ]);
        }

        if (! $this->codeService->verify($code, $pending->verification_code)) {
            $this->pendingRepo->incrementAttempts($pending);
            throw ValidationException::withMessages([
                'code' => ['The verification code is incorrect.'],
            ]);
        }

        // Atomic: create user + assign role + delete pending row.
        $user = DB::transaction(function () use ($pending) {
            $user = $this->userRepo->create([
                'email' => $pending->email,
                'password' => $pending->password, // already hashed
                'email_verified_at' => now(),
                'account_type' => AccountType::CUSTOMER, // default until onboarding
                'onboarding_completed' => false,
            ]);

            $user->assignRole(RoleName::CUSTOMER->value);

            $this->pendingRepo->delete($pending);

            return $user;
        });

        return $user;
    }

    public function resendVerification(string $email): void
    {
        $pending = $this->pendingRepo->findByEmail($email);

        if (! $pending) {
            // Generic response — do not leak whether email is registered.
            return;
        }

        $cooldown = (int) config('auth.verification_resend_cooldown_seconds', 60) ?: 60;

        if (! $pending->canResend($cooldown)) {
            $wait = $pending->last_sent_at->addSeconds($cooldown)->diffInSeconds(now());
            throw ValidationException::withMessages([
                'email' => ["Please wait {$wait} seconds before requesting a new code."],
            ]);
        }

        $code = $this->codeService->generate();
        $ttl = (int) config('auth.verification_code_ttl_minutes', 15) ?: 15;

        $this->pendingRepo->update($pending, [
            'verification_code' => $this->codeService->hash($code),
            'attempts' => 0,
            'expires_at' => now()->addMinutes($ttl),
            'last_sent_at' => now(),
        ]);

        SendVerificationCodeJob::dispatch($pending->email, $code);
    }
}