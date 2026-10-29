<?php

namespace Database\Seeders;

use App\Enums\Auth\RoleName;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleAndPermissionSeeder extends Seeder
{
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Base permissions (extend per module later).
        $permissions = [
            'manage platform',
            'manage agents',
            'manage services',
            'manage bookings',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        // Roles (idempotent).
        $customer = Role::findOrCreate(RoleName::CUSTOMER->value, 'web');
        $customer->syncPermissions([]);

        $agent = Role::findOrCreate(RoleName::AGENT->value, 'web');
        $agent->syncPermissions([]);

        $superAdmin = Role::findOrCreate(RoleName::SUPER_ADMIN->value, 'web');
        $superAdmin->syncPermissions(Permission::all());
    }
}