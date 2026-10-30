<?php

namespace App\Enums\UserProfile;

enum EmailChangeStep: string
{
    case AWAITING_CURRENT_EMAIL_CODE = 'awaiting_current_email_code';
    case AWAITING_NEW_EMAIL_CODE = 'awaiting_new_email_code';
    case PASSWORD_VERIFIED_AWAITING_NEW_EMAIL_CODE = 'password_verified_awaiting_new_email_code';
}