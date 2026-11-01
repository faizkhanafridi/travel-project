<?php
// app/Services/UserProfile/EmailChange/EmailChangeService.php

namespace App\Services\UserProfile\EmailChange;

use App\Enums\UserProfile\EmailChangeStage;
use App\Mail\UserProfile\EmailChangeCurrentCodeMail;
use App\Mail\UserProfile\EmailChangeNewCodeMail;
use App\Models\Auth\User;
use App\Models\UserProfile\EmailChange\EmailChangeRequest;
use App\Repositories\Contracts\UserProfile\EmailChange\EmailChangeRequestRepositoryInterface;
use App\Repositories\Contracts\Auth\UserRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class EmailChangeService
{
    public function __construct(
        private EmailChangeRequestRepositoryInterface $requests,
        private UserRepositoryInterface $users,
    ) {}

    public function startStandard(User $user, string $newEmail): EmailChangeRequest
    {
        $this->guardNewEmail($user, $newEmail);
        $this->guardNotRateLimited($user);

        return DB::transaction(function () use ($user, $newEmail) {
            $this->requests->findActiveForUser($user)?->delete();

            $plain = $this->generateCode();
            $request = $this->requests->create([
                'user_id' => $user->id,
                'new_email' => $newEmail,
                'current_email_code_hash' => Hash::make($plain),
                'stage' => EmailChangeStage::CURRENT_EMAIL_VERIFY->value,
                'current_email_attempts' => 0,
                'current_email_expires_at' => now()->addMinutes((int) config('auth.code_ttl', 10)),
                'last_sent_at' => now(),
            ]);

            Mail::to($user->email)->queue(new EmailChangeCurrentCodeMail($user->name, $user->email, $plain));

            return $request;
        });
    }

    public function startWithPassword(User $user, string $newEmail, string $currentPassword): EmailChangeRequest
    {
        $this->guardNewEmail($user, $newEmail);
        $this->guardNotRateLimited($user);

        if (! $user->password || ! Hash::check($currentPassword, $user->password)) {
            throw new UnprocessableEntityHttpException('Current password is incorrect.');
        }

        return DB::transaction(function () use ($user, $newEmail) {
            $this->requests->findActiveForUser($user)?->delete();

            $plain = $this->generateCode();
            $request = $this->requests->create([
                'user_id' => $user->id,
                'new_email' => $newEmail,
                'password_verified' => true,
                'stage' => EmailChangeStage::NEW_EMAIL_VERIFY->value,
                'new_email_code_hash' => Hash::make($plain),
                'new_email_attempts' => 0,
                'new_email_expires_at' => now()->addMinutes((int) config('auth.code_ttl', 10)),
                'last_sent_at' => now(),
            ]);

            Mail::to($newEmail)->queue(new EmailChangeNewCodeMail($user->name, $newEmail, $plain));

            return $request;
        });
    }

    public function verifyCurrentEmail(User $user, string $plainCode): EmailChangeRequest
    {
        $request = $this->requireActive($user);

        if ($request->stage !== EmailChangeStage::CURRENT_EMAIL_VERIFY) {
            throw new UnprocessableEntityHttpException('Invalid stage for current-email verification.');
        }
        if ($request->isExpired()) {
            $this->requests->delete($request);
            throw new UnprocessableEntityHttpException('Verification code has expired.');
        }
        if ($request->current_email_attempts >= 5) {
            $this->requests->delete($request);
            throw new UnprocessableEntityHttpException('Too many attempts. Start again.');
        }
        if (! Hash::check($plainCode, (string) $request->current_email_code_hash)) {
            $this->requests->update($request, ['current_email_attempts' => $request->current_email_attempts + 1]);
            throw new UnprocessableEntityHttpException('Invalid verification code.');
        }

        $plain = $this->generateCode();

        Mail::to($request->new_email)->queue(new EmailChangeNewCodeMail($user->name, $request->new_email, $plain));

        return $this->requests->update($request, [
            'stage' => EmailChangeStage::NEW_EMAIL_VERIFY->value,
            'current_email_code_hash' => null,
            'current_email_attempts' => 0,
            'current_email_expires_at' => null,
            'new_email_code_hash' => Hash::make($plain),
            'new_email_attempts' => 0,
            'new_email_expires_at' => now()->addMinutes((int) config('auth.code_ttl', 10)),
            'last_sent_at' => now(),
        ]);
    }

    public function verifyNewEmail(User $user, string $plainCode): User
    {
        $request = $this->requireActive($user);

        if ($request->stage !== EmailChangeStage::NEW_EMAIL_VERIFY) {
            throw new UnprocessableEntityHttpException('Invalid stage for new-email verification.');
        }
        if ($request->isExpired()) {
            $this->requests->delete($request);
            throw new UnprocessableEntityHttpException('Verification code has expired.');
        }
        if ($request->new_email_attempts >= 5) {
            $this->requests->delete($request);
            throw new UnprocessableEntityHttpException('Too many attempts. Start again.');
        }
        if (! Hash::check($plainCode, (string) $request->new_email_code_hash)) {
            $this->requests->update($request, ['new_email_attempts' => $request->new_email_attempts + 1]);
            throw new UnprocessableEntityHttpException('Invalid verification code.');
        }

        if ($this->users->findByEmail($request->new_email)) {
            $this->requests->delete($request);
            throw new UnprocessableEntityHttpException('This email is no longer available.');
        }

        return DB::transaction(function () use ($user, $request) {
            $user->forceFill([
                'email' => $request->new_email,
                'email_verified_at' => now(),
            ])->save();

            $this->requests->delete($request);

            return $user->fresh();
        });
    }

    public function cancel(User $user): void
    {
        $request = $this->requests->findActiveForUser($user);
        if ($request) {
            $this->requests->delete($request);
        }
    }
    public function status(User $user): ?EmailChangeRequest
    {
        return $this->requests->findActiveForUser($user);
    }
    private function requireActive(User $user): EmailChangeRequest
    {
        $request = $this->requests->findActiveForUser($user);
        if (! $request) {
            throw new UnprocessableEntityHttpException('No email change request in progress.');
        }
        return $request;
    }

    private function guardNewEmail(User $user, string $newEmail): void
    {
        $newEmail = strtolower($newEmail);
        if ($newEmail === strtolower((string) $user->email)) {
            throw new UnprocessableEntityHttpException('New email must differ from current email.');
        }
        if ($this->users->findByEmail($newEmail)) {
            // generic — do not leak existence
            throw new UnprocessableEntityHttpException('This email cannot be used.');
        }
    }

    private function guardNotRateLimited(User $user): void
    {
        $existing = $this->requests->findActiveForUser($user);
        if ($existing && $existing->last_sent_at && $existing->last_sent_at->diffInSeconds(now()) < 60) {
            throw new UnprocessableEntityHttpException('Please wait before starting another request.');
        }
    }

    private function generateCode(): string
    {
        return str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }
}