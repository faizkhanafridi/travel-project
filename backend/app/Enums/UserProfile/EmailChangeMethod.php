<?php

namespace App\Enums\UserProfile;

enum EmailChangeMethod: string
{
    case CURRENT_EMAIL_CODE = 'current_email_code';
    case PASSWORD = 'password';
}