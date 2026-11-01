<?php
// database/seeders/Auth/RoleSeeder.php

namespace Database\Seeders\Auth;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
class RoleSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach (['web', 'sanctum'] as $guard) {
            Role::findOrCreate('customer', $guard);
            Role::findOrCreate('agent', $guard);
            Role::findOrCreate('super_admin', $guard);
        }
    }
}