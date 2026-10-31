<?php
// app/Services/Auth/SocialAuthService.php

namespace App\Services\Auth;

use App\Enums\Auth\UserRole;
use App\Enums\Auth\UserStatus;
use App\Models\Auth\User;
use App\Repositories\Contracts\Auth\UserRepositoryInterface;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialUser;

class SocialAuthService
{
    public function __construct(private UserRepositoryInterface $userRepo) {}

    public function redirectUrl(string $provider): string
    {
        return Socialite::driver($provider)
            ->stateless(false)
            ->with(['prompt' => 'select_account'])
            ->redirect()
            ->getTargetUrl();
    }

    public function handleCallback(string $provider): User
    {
        /** @var SocialUser $social */
        $social = Socialite::driver($provider)->stateless(false)->user();

        $email = $social->getEmail();
        if (! $email) {
            throw new \RuntimeException('No email returned from provider.');
        }

        return DB::transaction(function () use ($provider, $social, $email) {
            $existing = User::where('email', $email)->first();
            if ($existing) {
                if ($provider === 'google' && ! $existing->google_id) {
                    $existing->google_id = $social->getId();
                }
                if ($provider === 'facebook' && ! $existing->facebook_id) {
                    $existing->facebook_id = $social->getId();
                }
                $existing->save();
                Auth::login($existing, true);
                request()->session()->regenerate();
                return $existing;
            }

            $user = $this->userRepo->create([
                'name' => $social->getName() ?: Str::before($email, '@'),
                'email' => $email,
                'password' => null,
                'email_verified_at' => now(),
                'status' => UserStatus::ACTIVE->value,
                'google_id' => $provider === 'google' ? $social->getId() : null,
                'facebook_id' => $provider === 'facebook' ? $social->getId() : null,
            ]);
            $this->userRepo->assignRole($user, UserRole::CUSTOMER->value);
            Auth::login($user, true);
            request()->session()->regenerate();
            return $user;
        });
    }
}