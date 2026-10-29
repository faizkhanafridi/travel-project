<?php

namespace App\Repositories\Eloquent\Auth;

use App\Models\Auth\SocialAccount;
use App\Repositories\Contracts\Auth\SocialAccountRepositoryInterface;

class SocialAccountRepository implements SocialAccountRepositoryInterface
{
    public function findByProvider(string $provider, string $providerUserId): ?SocialAccount
    {
        return SocialAccount::where('provider', $provider)
            ->where('provider_user_id', $providerUserId)
            ->first();
    }

    public function create(array $data): SocialAccount
    {
        return SocialAccount::create($data);
    }
}