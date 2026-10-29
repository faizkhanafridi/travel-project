<?php

namespace App\Repositories\Contracts\Auth;

use App\Models\Auth\PendingRegistration;

interface PendingRegistrationRepositoryInterface
{
    public function findByEmail(string $email): ?PendingRegistration;

    public function create(array $data): PendingRegistration;

    public function update(PendingRegistration $pending, array $data): PendingRegistration;

    public function delete(PendingRegistration $pending): void;

    public function incrementAttempts(PendingRegistration $pending): void;
}