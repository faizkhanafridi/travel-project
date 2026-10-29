<?php

namespace App\Repositories\Eloquent\Auth;

use App\Models\Auth\PendingRegistration;
use App\Repositories\Contracts\Auth\PendingRegistrationRepositoryInterface;

class PendingRegistrationRepository implements PendingRegistrationRepositoryInterface
{
    public function findByEmail(string $email): ?PendingRegistration
    {
        return PendingRegistration::where('email', $email)->first();
    }

    public function create(array $data): PendingRegistration
    {
        return PendingRegistration::create($data);
    }

    public function update(PendingRegistration $pending, array $data): PendingRegistration
    {
        $pending->update($data);

        return $pending->refresh();
    }

    public function delete(PendingRegistration $pending): void
    {
        $pending->delete();
    }

    public function incrementAttempts(PendingRegistration $pending): void
    {
        $pending->increment('attempts');
    }
}