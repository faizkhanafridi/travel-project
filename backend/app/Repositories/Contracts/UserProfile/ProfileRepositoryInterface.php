<?php
// app/Repositories/Contracts/UserProfile/ProfileRepositoryInterface.php

namespace App\Repositories\Contracts\UserProfile;

use App\Models\Auth\User;
use App\Models\UserProfile\Profile;

interface ProfileRepositoryInterface
{
    public function findByUser(User $user): ?Profile;

    public function findByUuid(string $uuid): ?Profile;

    public function createForUser(User $user, array $data): Profile;

    public function update(Profile $profile, array $data): Profile;

    public function usernameExists(string $username, ?int $exceptUserId = null): bool;
}