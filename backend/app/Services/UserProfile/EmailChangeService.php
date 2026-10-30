<?php

namespace App\Services\UserProfile;

use App\Enums\UserProfile\EmailChangeMethod;
use App\Enums\UserProfile\EmailChangeStep;
use App\Jobs\UserProfile\SendEmailChangeCodeJob;
use App\Models\User;
use App\Models\UserProfile\EmailChangeRequest;
use App\Repositories\Contracts\Auth\UserRepositoryInterface;
use App\Repositories\Contracts\UserProfile\EmailChangeRequestRepositoryInterface;
use App\Services\Auth\VerificationCodeService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class EmailChangeService
{
    public function __construct(
        private EmailChangeRequestRepositoryInterface $repo,
        private UserRepositoryInterface $userRepo,
        private VerificationCodeService $codeService,
    ) {}

    /**
     * Standard flow step 1: user submits new email → code goes to CURRENT email.
     */
    public function initiateWithCurrentEmail(User $user, string $newEmail): EmailChangeRequest
    {
        $this->assertEmailAvailable($user, $newEmail);

        $code = $this->codeService->generate();
        $ttl = (int) config('user_profile.email_change_code_ttl', 15);

        $this->invalidateActive($user);

        $request = $this->repo->create($user, [
            'new_email' => $newEmail,
            'method' => EmailChangeMethod::CURRENT_EMAIL_CODE->value,
            'step' => EmailChangeStep::AWAITING_CURRENT_EMAIL_CODE->value,
            'current_email_code' => $this->codeService->hash($code),
            'current_email_attempts' => 0,
            'current_email_expires_at' => now()->addMinutes($ttl),
            'last_sent_at' => now(),
        ]);

        SendEmailChangeCodeJob::dispatch($user->email, $code, 'current');

        return $request;
    }

    /**
     * Verify the code sent to the CURRENT email; then send code to NEW email.
     */
    public function verifyCurrentEmailCode(User $user, string $code): EmailChangeRequest
    {
        $request = $this->requireRequest($user, EmailChangeStep::AWAITING_CURRENT_EMAIL_CODE);

        $this->assertNotExpired($request->current_email_expires_at);
        $this->assertAttempts($request->current_email_attempts);

        if (! $this->codeService->verify($code, (string) $request->current_email_code)) {
            $this->repo->update($request, [
                'current_email_attempts' => $request->current_email_attempts + 1,
            ]);
            throw ValidationException::withMessages([
                'code' => ['The verification code is incorrect.'],
            ]);
        }

        // Issue code for NEW email.
        $newCode = $this->codeService->generate();
        $ttl = (int) config('user_profile.email_change_code_ttl', 15);

        $this->repo->update($request, [
            'step' => EmailChangeStep::AWAITING_NEW_EMAIL_CODE->value,
            'new_email_code' => $this->codeService->hash($newCode),
            'new_email_attempts' => 0,
            'new_email_expires_at' => now()->addMinutes($ttl),
            'last_sent_at' => now(),
        ]);
        $request->refresh();

        SendEmailChangeCodeJob::dispatch(
            $request->new_email,
            $newCode,
            'new'
        );

        return $request;
    }

    /**
     * Alternative flow: user provides password → code sent to NEW email.
     */
    public function initiateWithPassword(User $user, string $newEmail, string $password): EmailChangeRequest
    {
        $this->assertEmailAvailable($user, $newEmail);

        if (! $user->hasPassword() || ! Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        $code = $this->codeService->generate();
        $ttl = (int) config('user_profile.email_change_code_ttl', 15);

        $this->invalidateActive($user);

        $request = $this->repo->create($user, [
            'new_email' => $newEmail,
            'method' => EmailChangeMethod::PASSWORD->value,
            'step' => EmailChangeStep::PASSWORD_VERIFIED_AWAITING_NEW_EMAIL_CODE->value,
            'new_email_code' => $this->codeService->hash($code),
            'new_email_attempts' => 0,
            'new_email_expires_at' => now()->addMinutes($ttl),
            'last_sent_at' => now(),
        ]);

        SendEmailChangeCodeJob::dispatch($newEmail, $code, 'new');

        return $request;
    }

    /**
     * Complete: verify code sent to new email and finally update the user's email.
     */
    public function verifyNewEmailCode(User $user, string $code): User
    {
        $request = $this->requireRequest(
            $user,
            EmailChangeStep::AWAITING_NEW_EMAIL_CODE,
            EmailChangeStep::PASSWORD_VERIFIED_AWAITING_NEW_EMAIL_CODE,
        );

        $this->assertNotExpired($request->new_email_expires_at);
        $this->assertAttempts($request->new_email_attempts);

        if (! $this->codeService->verify($code, (string) $request->new_email_code)) {
            $this->repo->update($request, [
                'new_email_attempts' => $request->new_email_attempts + 1,
            ]);
            throw ValidationException::withMessages([
                'code' => ['The verification code is incorrect.'],
            ]);
        }

        $this->assertEmailAvailable($user, $request->new_email);

        return DB::transaction(function () use ($user, $request) {
            $user->forceFill([
                'email' => $request->new_email,
                'email_verified_at' => now(),
            ])->save();

            $this->repo->delete($request);

            return $user->refresh();
        });
    }

    private function requireRequest(User $user, EmailChangeStep ...$allowedSteps): EmailChangeRequest
    {
        $request = $this->repo->activeForUser($user);

        if (! $request) {
            throw ValidationException::withMessages([
                'email' => ['No active email change request.'],
            ]);
        }

        $allowed = array_map(fn($s) => $s->value, $allowedSteps);
        if (! in_array($request->step, $allowed, true)) {
            throw ValidationException::withMessages([
                'email' => ['This step is not valid for the current request.'],
            ]);
        }

        return $request;
    }

    private function invalidateActive(User $user): void
    {
        $existing = $this->repo->activeForUser($user);
        if ($existing) {
            $this->repo->delete($existing);
        }
    }

    private function assertEmailAvailable(User $user, string $newEmail): void
    {
        if (strtolower($user->email) === strtolower($newEmail)) {
            throw ValidationException::withMessages([
                'new_email' => ['The new email is the same as your current email.'],
            ]);
        }

        if ($this->userRepo->findByEmail($newEmail)) {
            throw ValidationException::withMessages([
                'new_email' => ['This email is already in use.'],
            ]);
        }
    }

    private function assertNotExpired($expiresAt): void
    {
        if (! $expiresAt || $expiresAt->isPast()) {
            throw ValidationException::withMessages([
                'code' => ['This verification code has expired. Please start again.'],
            ]);
        }
    }

    private function assertAttempts(int $attempts): void
    {
        $max = (int) config('user_profile.email_change_max_attempts', 5);
        if ($attempts >= $max) {
            throw ValidationException::withMessages([
                'code' => ['Too many incorrect attempts. Please start again.'],
            ]);
        }
    }
}
