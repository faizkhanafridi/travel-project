<?php
// app/Repositories/Eloquent/Auth/UserRepository.php

namespace App\Repositories\Eloquent\Auth;

use App\Models\Auth\User;
use App\Repositories\Contracts\Auth\UserRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class UserRepository implements UserRepositoryInterface
{
    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    public function create(array $data): User
    {
        $data['uuid'] = $data['uuid'] ?? (string) Str::uuid();

        return User::create($data);
    }

    public function assignRole(User $user, string $role): void
    {
        $user->syncRoles([$role]);
    }

    public function updatePassword(User $user, string $hashedPassword): void
    {
        // use forceFill to bypass the hashed cast (already hashed)
        $user->forceFill(['password' => $hashedPassword])->save();
    }

    public function invalidateSessions(User $user, ?string $exceptSessionId = null): void
    {
        $query = DB::table('sessions')->where('user_id', $user->id);
        if ($exceptSessionId) {
            $query->where('id', '!=', $exceptSessionId);
        }
        $query->delete();
    }
}