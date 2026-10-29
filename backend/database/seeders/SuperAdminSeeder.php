<?php

namespace Database\Seeders;

use App\Enums\Auth\AccountType;
use App\Enums\Auth\RoleName;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'admin@travelmarketplace.test'],
            [
                        'uuid' => (string) Str::uuid(),

                'password' => Hash::make('admin@travelmarketplace.test'),
                'email_verified_at' => now(),
                'account_type' => AccountType::SUPER_ADMIN,
                'onboarding_completed' => true,
            ],
        );

        $user->syncRoles([RoleName::SUPER_ADMIN->value]);

        $this->command->warn('SuperAdmin created: admin@travelmarketplace.test — change the password immediately.');
    }
}