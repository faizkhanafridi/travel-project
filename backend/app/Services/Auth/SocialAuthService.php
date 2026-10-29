<?php

namespace App\Services\Auth;

use App\Enums\Auth\AccountType;
use App\Enums\Auth\RoleName;
use App\Models\User;
use App\Repositories\Contracts\Auth\SocialAccountRepositoryInterface;
use App\Repositories\Contracts\Auth\UserRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialAuthService
{
    public function __construct(
        private UserRepositoryInterface $userRepo,
        private SocialAccountRepositoryInterface $socialRepo,
    ) {}

    public function redirect(string $provider)
    {
        return Socialite::driver($provider)->redirect();
    }

    public function callback(string $provider): User
    {
        $socialUser = Socialite::driver($provider)->user();

        // 1. Already linked social account?
        $linked = $this->socialRepo->findByProvider($provider, (string) $socialUser->getId());

        if ($linked) {
            return $linked->user;
        }

        // 2. Existing user with same verified email? Link it.
        if ($socialUser->getEmail()) {
            $existing = $this->userRepo->findByEmail($socialUser->getEmail());

            if ($existing) {
                $this->socialRepo->create([
                    'user_id' => $existing->id,
                    'provider' => $provider,
                    'provider_user_id' => (string) $socialUser->getId(),
                ]);

                // Ensure email is marked verified because the provider verified it.
                if (! $existing->email_verified_at) {
                    $this->userRepo->markEmailVerified($existing);
                }

                return $existing->refresh();
            }
        }

        // 3. Brand new user — social email is verified by the provider.
        $user = DB::transaction(function () use ($provider, $socialUser) {
            $email = $socialUser->getEmail() ?? Str::uuid().'@social.local';

            $user = $this->userRepo->create([
                'email' => $email,
                'password' => null,
                'email_verified_at' => now(),
                'account_type' => AccountType::CUSTOMER,
                'onboarding_completed' => false,
            ]);

            $user->assignRole(RoleName::CUSTOMER->value);

            $this->socialRepo->create([
                'user_id' => $user->id,
                'provider' => $provider,
                'provider_user_id' => (string) $socialUser->getId(),
            ]);

            return $user;
        });

        return $user;
    }
}