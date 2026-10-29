<?php

namespace App\Repositories\Contracts\Auth;

use App\Models\User;

interface UserRepositoryInterface
{
    public function findByEmail(string $email): ?User;

    public function findByUuid(string $uuid): ?User;

    public function create(array $data): User;

    public function markEmailVerified(User $user): User;

    public function updatePassword(User $user, string $hashedPassword): User;

    public function updateOnboarding(User $user, array $data): User;
}