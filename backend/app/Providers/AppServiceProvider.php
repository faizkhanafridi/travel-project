<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Bind repository interfaces → Eloquent implementations.
        $this->app->bind(
            \App\Repositories\Contracts\Auth\PendingRegistrationRepositoryInterface::class,
            \App\Repositories\Eloquent\Auth\PendingRegistrationRepository::class,
        );
        $this->app->bind(
            \App\Repositories\Contracts\Auth\UserRepositoryInterface::class,
            \App\Repositories\Eloquent\Auth\UserRepository::class,
        );
        $this->app->bind(
            \App\Repositories\Contracts\Auth\SocialAccountRepositoryInterface::class,
            \App\Repositories\Eloquent\Auth\SocialAccountRepository::class,
        );
    }

    public function boot(): void
    {
        // Login: 5 attempts / minute per email+IP.
        RateLimiter::for('auth.login', function (Request $request) {
            return Limit::perMinute(5)->by(
                $request->input('email').'|'.$request->ip()
            );
        });

        // Register / forgot / resend: 3 / minute per IP.
        RateLimiter::for('auth.registration', function (Request $request) {
            return Limit::perMinute(3)->by($request->ip());
        });

        // Verify email: 6 / minute per email+IP.
        RateLimiter::for('auth.verify', function (Request $request) {
            return Limit::perMinute(6)->by(
                $request->input('email').'|'.$request->ip()
            );
        });

        // Social login: 10 / minute per IP.
        RateLimiter::for('auth.social', function (Request $request) {
            return Limit::perMinute(10)->by($request->ip());
        });
    }
}