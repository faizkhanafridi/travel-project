<?php
// app/Repositories/Contracts/Auth/UserRepositoryInterface.php

namespace App\Repositories\Contracts\Auth;

use App\Models\Auth\User;

interface UserRepositoryInterface
{
    public function findByEmail(string $email): ?User;

    public function create(array $data): User;

    public function assignRole(User $user, string $role): void;

    public function updatePassword(User $user, string $hashedPassword): void;

    public function invalidateSessions(User $user, ?string $exceptSessionId = null): void;
}