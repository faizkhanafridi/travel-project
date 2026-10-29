<?php

namespace App\Enums\Auth;

enum RoleName: string
{
    case CUSTOMER = 'customer';
    case AGENT = 'agent';
    case SUPER_ADMIN = 'super_admin';
}