<?php

namespace App\Repositories\Eloquent\Auth;

use App\Models\User;
use App\Repositories\Contracts\Auth\UserRepositoryInterface;

class UserRepository implements UserRepositoryInterface
{
    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    public function findByUuid(string $uuid): ?User
    {
        return User::where('uuid', $uuid)->first();
    }

    public function create(array $data): User
    {
        return User::create($data);
    }

    public function markEmailVerified(User $user): User
    {
        $user->forceFill(['email_verified_at' => now()])->save();

        return $user->refresh();
    }

    public function updatePassword(User $user, string $hashedPassword): User
    {
        $user->forceFill(['password' => $hashedPassword])->save();

        return $user->refresh();
    }

    public function updateOnboarding(User $user, array $data): User
    {
        $user->update($data);

        return $user->refresh();
    }
}