<?php
// app/Repositories/Eloquent/UserProfile/ProfileRepository.php

namespace App\Repositories\Eloquent\UserProfile;

use App\Models\Auth\User;
use App\Models\UserProfile\Profile;
use App\Repositories\Contracts\UserProfile\ProfileRepositoryInterface;
use Illuminate\Support\Str;

class ProfileRepository implements ProfileRepositoryInterface
{
    public function findByUser(User $user): ?Profile
    {
        return Profile::where('user_id', $user->id)->first();
    }

    public function findByUuid(string $uuid): ?Profile
    {
        return Profile::where('uuid', $uuid)->first();
    }

    public function createForUser(User $user, array $data): Profile
    {
        $data['uuid'] = $data['uuid'] ?? (string) Str::uuid();
        $data['user_id'] = $user->id;

        return Profile::create($data);
    }

    public function update(Profile $profile, array $data): Profile
    {
        $profile->fill($data)->save();

        return $profile->fresh();
    }

    public function usernameExists(string $username, ?int $exceptUserId = null): bool
    {
        $query = User::where('username', $username);
        if ($exceptUserId) {
            $query->where('id', '!=', $exceptUserId);
        }

        return $query->exists();
    }
}