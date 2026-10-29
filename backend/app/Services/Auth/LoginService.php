<?php

namespace App\Services\Auth;

use App\Models\User;
use App\Repositories\Contracts\Auth\UserRepositoryInterface;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class LoginService
{
    public function __construct(
        private UserRepositoryInterface $userRepo,
    ) {}

    public function attempt(string $email, string $password): User
    {
        $user = $this->userRepo->findByEmail($email);

        // Generic message to reduce account enumeration.
        if (! $user || ! $user->hasPassword() || ! Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (! $user->email_verified_at) {
            throw ValidationException::withMessages([
                'email' => ['Please verify your email address before logging in.'],
            ]);
        }

        return $user;
    }
}