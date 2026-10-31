<?php
// app/Services/Auth/MfaService.php

namespace App\Services\Auth;

use App\Models\Auth\User;
use Illuminate\Support\Facades\Auth;
use PragmaRX\Google2FA\Google2FA;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class MfaService
{
    public function __construct(private Google2FA $google2fa) {}

    /**
     * @return array{secret: string, otpauth_url: string}
     */
    public function setup(User $user): array
    {
        if ($user->hasMfaEnabled()) {
            throw new UnprocessableEntityHttpException('MFA is already enabled.');
        }

        $secret = $this->google2fa->generateSecretKey();
        $user->forceFill(['two_factor_secret' => $secret])->save();

        $otpauth = $this->google2fa->getQRCodeUrl(
            config('app.name'),
            $user->email,
            $secret
        );

        return ['secret' => $secret, 'otpauth_url' => $otpauth];
    }

    public function confirm(User $user, string $code): void
    {
        if ($user->hasMfaEnabled()) {
            throw new UnprocessableEntityHttpException('MFA is already enabled.');
        }
        if (! $user->two_factor_secret) {
            throw new UnprocessableEntityHttpException('Run MFA setup first.');
        }
        if (! $this->google2fa->verifyKey($user->two_factor_secret, $code)) {
            throw new UnprocessableEntityHttpException('Invalid code.');
        }

        $user->forceFill(['two_factor_confirmed_at' => now()])->save();
    }

    public function verifyChallenge(string $code): User
    {
        $userId = session('2fa:user_id');
        if (! $userId) {
            throw new UnprocessableEntityHttpException('No MFA challenge in progress.');
        }

        /** @var User|null $user */
        $user = User::find($userId);
        if (! $user || ! $user->two_factor_secret || ! $user->hasMfaEnabled()) {
            session()->forget(['2fa:user_id', '2fa:remember']);
            throw new UnprocessableEntityHttpException('Invalid MFA state.');
        }

        if (! $this->google2fa->verifyKey($user->two_factor_secret, $code)) {
            throw new UnprocessableEntityHttpException('Invalid code.');
        }

        $remember = (bool) session('2fa:remember', false);
        session()->forget(['2fa:user_id', '2fa:remember']);

        Auth::login($user, $remember);
        request()->session()->regenerate();

        return $user;
    }

    public function disable(User $user): void
    {
        $user->forceFill([
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ])->save();
    }
}