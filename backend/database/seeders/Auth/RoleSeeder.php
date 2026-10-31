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

        Role::findOrCreate('customer', 'web');
        Role::findOrCreate('agent', 'web');
        Role::findOrCreate('super_admin', 'web');
    }
}