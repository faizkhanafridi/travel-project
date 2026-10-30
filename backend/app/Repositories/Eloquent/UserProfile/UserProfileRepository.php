<?php

namespace App\Repositories\Eloquent\UserProfile;

use App\Models\User;
use App\Models\UserProfile\UserProfile;
use App\Repositories\Contracts\UserProfile\UserProfileRepositoryInterface;

class UserProfileRepository implements UserProfileRepositoryInterface
{
    public function findByUser(User $user): ?UserProfile
    {
        return UserProfile::where('user_id', $user->id)->first();
    }

    public function findByUsername(string $username): ?UserProfile
    {
        return UserProfile::where('username', $username)->first();
    }

    public function usernameExists(string $username, ?int $ignoreProfileId = null): bool
    {
        return UserProfile::where('username', $username)
            ->when($ignoreProfileId, fn ($q) => $q->where('id', '!=', $ignoreProfileId))
            ->exists();
    }

    public function create(User $user, array $data): UserProfile
    {
        return UserProfile::create(array_merge($data, ['user_id' => $user->id]));
    }

    public function update(UserProfile $profile, array $data): UserProfile
    {
        $profile->update($data);

        return $profile->refresh();
    }

    public function syncLanguages(UserProfile $profile, array $languageIds): void
    {
        $profile->languages()->sync($languageIds);
    }
}