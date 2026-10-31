<?php
// app/Providers/RepositoryServiceProvider.php

namespace App\Providers;

use App\Repositories\Contracts\Auth\PasswordResetCodeRepositoryInterface;
use App\Repositories\Contracts\Auth\PendingRegistrationRepositoryInterface;
use App\Repositories\Contracts\Auth\UserRepositoryInterface;
use App\Repositories\Eloquent\Auth\PasswordResetCodeRepository;
use App\Repositories\Eloquent\Auth\PendingRegistrationRepository;
use App\Repositories\Eloquent\Auth\UserRepository;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(UserRepositoryInterface::class, UserRepository::class);
        $this->app->bind(PendingRegistrationRepositoryInterface::class, PendingRegistrationRepository::class);
        $this->app->bind(PasswordResetCodeRepositoryInterface::class, PasswordResetCodeRepository::class);
    }
}