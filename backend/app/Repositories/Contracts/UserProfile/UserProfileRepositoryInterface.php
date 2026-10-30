<?php

namespace App\Repositories\Contracts\UserProfile;

use App\Models\User;
use App\Models\UserProfile\UserProfile;

interface UserProfileRepositoryInterface
{
    public function findByUser(User $user): ?UserProfile;

    public function findByUsername(string $username): ?UserProfile;

    public function usernameExists(string $username, ?int $ignoreProfileId = null): bool;

    public function create(User $user, array $data): UserProfile;

    public function update(UserProfile $profile, array $data): UserProfile;

    public function syncLanguages(UserProfile $profile, array $languageIds): void;
}