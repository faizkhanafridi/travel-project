<?php
// database/seeders/Auth/SuperAdminSeeder.php

namespace Database\Seeders\Auth;

use App\Enums\Auth\UserRole;
use App\Enums\Auth\UserStatus;
use App\Models\Auth\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::firstOrCreate(
            ['email' => 'admin@travelmarketplace.test'],
            [
                'uuid' => (string) Str::uuid(),
                'name' => 'Platform Admin',
                'password' => Hash::make('admin@travelmarketplace.test'),
                'email_verified_at' => now(),
                'status' => UserStatus::ACTIVE->value,
                'onboarding_completed_at' => now(),
                'onboarding_choice' => \App\Enums\Auth\OnboardingChoice::CUSTOMER->value,
            ]
        );

        $admin->syncRoles([UserRole::SUPER_ADMIN->value]);
    }
}