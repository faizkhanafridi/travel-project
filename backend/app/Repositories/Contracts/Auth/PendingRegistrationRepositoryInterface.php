<?php
// app/Repositories/Contracts/Auth/PendingRegistrationRepositoryInterface.php

namespace App\Repositories\Contracts\Auth;

use App\Models\Auth\PendingRegistration;

interface PendingRegistrationRepositoryInterface
{
    public function findByEmail(string $email): ?PendingRegistration;

    public function upsert(string $email, array $data): PendingRegistration;

    public function incrementAttempts(PendingRegistration $pending): void;

    public function delete(PendingRegistration $pending): void;
}