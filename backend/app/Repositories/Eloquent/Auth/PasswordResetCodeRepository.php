<?php
// app/Repositories/Eloquent/Auth/PasswordResetCodeRepository.php

namespace App\Repositories\Eloquent\Auth;

use App\Models\Auth\PasswordResetCode;
use App\Repositories\Contracts\Auth\PasswordResetCodeRepositoryInterface;

class PasswordResetCodeRepository implements PasswordResetCodeRepositoryInterface
{
    public function findByEmail(string $email): ?PasswordResetCode
    {
        return PasswordResetCode::where('email', $email)->first();
    }

    public function upsert(string $email, array $data): PasswordResetCode
    {
        return PasswordResetCode::updateOrCreate(
            ['email' => $email],
            $data + ['email' => $email]
        );
    }

    public function incrementAttempts(PasswordResetCode $code): void
    {
        $code->increment('attempts');
    }

    public function delete(PasswordResetCode $code): void
    {
        $code->delete();
    }
}