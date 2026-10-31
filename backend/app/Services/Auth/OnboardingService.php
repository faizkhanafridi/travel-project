<?php
// app/Services/Auth/OnboardingService.php

namespace App\Services\Auth;

use App\Enums\Auth\OnboardingChoice;
use App\Models\Auth\User;

class OnboardingService
{
    public function complete(User $user, OnboardingChoice $choice): User
    {
        $user->forceFill([
            'onboarding_choice' => $choice->value,
            'onboarding_completed_at' => now(),
        ])->save();

        return $user->fresh();
    }

    public function skip(User $user): User
    {
        // skipping marks the user as a customer
        return $this->complete($user, OnboardingChoice::CUSTOMER);
    }
}