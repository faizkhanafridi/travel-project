<?php

namespace App\Enums\Auth;

enum AccountType: string
{
    case CUSTOMER = 'customer';
    case AGENT = 'agent';
    case SUPER_ADMIN = 'super_admin';
}