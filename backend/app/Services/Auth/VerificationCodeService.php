<?php

namespace App\Services\Auth;

use Illuminate\Support\Facades\Hash;

class VerificationCodeService
{
    public function generate(): string
    {
        return (string) random_int(100000, 999999);
    }

    public function hash(string $code): string
    {
        return Hash::make($code);
    }

    public function verify(string $code, string $hashedCode): bool
    {
        return Hash::check($code, $hashedCode);
    }
}