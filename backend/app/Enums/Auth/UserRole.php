<?php
// app/Enums/Auth/UserRole.php

namespace App\Enums\Auth;

enum UserRole: string
{
    case CUSTOMER = 'customer';
    case AGENT = 'agent';
    case SUPER_ADMIN = 'super_admin';

    public function label(): string
    {
        return match ($this) {
            self::CUSTOMER => 'Customer',
            self::AGENT => 'Agent',
            self::SUPER_ADMIN => 'Platform Admin',
        };
    }
}