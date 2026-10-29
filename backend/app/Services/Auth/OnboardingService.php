<?php

namespace App\Services\Auth;

use App\Enums\Auth\AccountType;
use App\Models\User;
use App\Repositories\Contracts\Auth\UserRepositoryInterface;
use Illuminate\Validation\ValidationException;

class OnboardingService
{
    public function __construct(
        private UserRepositoryInterface $userRepo,
    ) {}

    public function chooseRole(User $user, string $accountType): User
    {
        if ($user->onboarding_completed) {
            throw ValidationException::withMessages([
                'account_type' => ['Onboarding has already been completed.'],
            ]);
        }

        // Once a user has been approved as an agent, they cannot revert.
        if ($user->hasRole('agent') && $accountType === AccountType::CUSTOMER->value) {
            throw ValidationException::withMessages([
                'account_type' => ['Approved agents cannot switch back to a customer account.'],
            ]);
        }

        $enum = AccountType::tryFrom($accountType);

        if (! $enum || $enum === AccountType::SUPER_ADMIN) {
            throw ValidationException::withMessages([
                'account_type' => ['Invalid account type selected.'],
            ]);
        }

        return $this->userRepo->updateOnboarding($user, [
            'account_type' => $enum,
            'onboarding_completed' => true,
        ]);
    }
}