<?php
// app/Providers/RepositoryServiceProvider.php

namespace App\Providers;

use App\Repositories\Contracts\Auth\PasswordResetCodeRepositoryInterface;
use App\Repositories\Contracts\Auth\PendingRegistrationRepositoryInterface;
use App\Repositories\Contracts\Auth\UserRepositoryInterface;
use App\Repositories\Contracts\UserProfile\EmailChange\EmailChangeRequestRepositoryInterface;
use App\Repositories\Contracts\UserProfile\ProfileRepositoryInterface;
use App\Repositories\Eloquent\Auth\PasswordResetCodeRepository;
use App\Repositories\Eloquent\Auth\PendingRegistrationRepository;
use App\Repositories\Eloquent\Auth\UserRepository;
use App\Repositories\Eloquent\UserProfile\EmailChange\EmailChangeRequestRepository;
use App\Repositories\Eloquent\UserProfile\ProfileRepository;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Module 01

        $this->app->bind(UserRepositoryInterface::class, UserRepository::class);
        $this->app->bind(PendingRegistrationRepositoryInterface::class, PendingRegistrationRepository::class);
        $this->app->bind(PasswordResetCodeRepositoryInterface::class, PasswordResetCodeRepository::class);

    
          // Module 02
        $this->app->bind(ProfileRepositoryInterface::class, ProfileRepository::class);
        $this->app->bind(EmailChangeRequestRepositoryInterface::class, EmailChangeRequestRepository::class);


        // Module 03
                $this->app->bind(
            \App\Repositories\Contracts\Agent\AgentRepositoryInterface::class,
            \App\Repositories\Eloquent\Agent\AgentRepository::class,
        );
    }
}