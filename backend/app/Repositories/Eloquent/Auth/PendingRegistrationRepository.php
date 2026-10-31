<?php
// app/Repositories/Eloquent/Auth/PendingRegistrationRepository.php

namespace App\Repositories\Eloquent\Auth;

use App\Models\Auth\PendingRegistration;
use App\Repositories\Contracts\Auth\PendingRegistrationRepositoryInterface;

class PendingRegistrationRepository implements PendingRegistrationRepositoryInterface
{
    public function findByEmail(string $email): ?PendingRegistration
    {
        return PendingRegistration::where('email', $email)->first();
    }

    public function upsert(string $email, array $data): PendingRegistration
    {
        return PendingRegistration::updateOrCreate(
            ['email' => $email],
            $data + ['email' => $email]
        );
    }

    public function incrementAttempts(PendingRegistration $pending): void
    {
        $pending->increment('attempts');
    }

    public function delete(PendingRegistration $pending): void
    {
        $pending->delete();
    }
}