<?php

namespace App\Repositories\Contracts\Auth;

use App\Models\Auth\SocialAccount;

interface SocialAccountRepositoryInterface
{
    public function findByProvider(string $provider, string $providerUserId): ?SocialAccount;

    public function create(array $data): SocialAccount;
}