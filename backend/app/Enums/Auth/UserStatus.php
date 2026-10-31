<?php
// app/Enums/Auth/UserStatus.php

namespace App\Enums\Auth;

enum UserStatus: string
{
    case ACTIVE = 'active';
    case SUSPENDED = 'suspended';
    case BANNED = 'banned';
}