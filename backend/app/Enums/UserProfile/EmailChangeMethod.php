<?php
// app/Enums/UserProfile/EmailChangeMethod.php

namespace App\Enums\UserProfile;

enum EmailChangeMethod: string
{
    case STANDARD = 'standard';
    case PASSWORD = 'password';
}