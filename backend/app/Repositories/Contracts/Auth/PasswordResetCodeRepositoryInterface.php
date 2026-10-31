<?php
// app/Repositories/Contracts/Auth/PasswordResetCodeRepositoryInterface.php

namespace App\Repositories\Contracts\Auth;

use App\Models\Auth\PasswordResetCode;

interface PasswordResetCodeRepositoryInterface
{
    public function findByEmail(string $email): ?PasswordResetCode;

    public function upsert(string $email, array $data): PasswordResetCode;

    public function incrementAttempts(PasswordResetCode $code): void;

    public function delete(PasswordResetCode $code): void;
}