<?php
// app/Enums/Auth/OnboardingChoice.php

namespace App\Enums\Auth;

enum OnboardingChoice: string
{
    case CUSTOMER = 'customer';
    case AGENT = 'agent';
}