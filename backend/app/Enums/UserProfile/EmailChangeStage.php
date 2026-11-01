<?php
// app/Enums/UserProfile/EmailChangeStage.php

namespace App\Enums\UserProfile;

enum EmailChangeStage: string
{
    case CURRENT_EMAIL_VERIFY = 'CURRENT_EMAIL_VERIFY';
    case NEW_EMAIL_VERIFY = 'NEW_EMAIL_VERIFY';
}