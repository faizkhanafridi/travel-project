<?php
// app/Providers/AppServiceProvider.php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // MODULE 01 Authentication rate limits
        RateLimiter::for('auth-login', function (Request $request) {
            $key = strtolower($request->input('email', '') . '|' . $request->ip());
            return Limit::perMinute(5)->by($key)
                ->response(fn() => response()->json(['message' => 'Too many attempts. Try again shortly.'], 429));
        });

        RateLimiter::for('auth-register', fn(Request $r) => Limit::perHour(5)->by($r->ip()));

        RateLimiter::for('auth-verify', function (Request $r) {
            return Limit::perMinutes(10, 5)->by(strtolower($r->input('email', '')) . '|' . $r->ip());
        });

        RateLimiter::for('auth-resend', fn(Request $r) => Limit::perMinutes(5, 3)->by(strtolower($r->input('email', '')) . '|' . $r->ip()));

        RateLimiter::for('auth-forgot', fn(Request $r) => Limit::perHour(82)->by(strtolower($r->input('email', '')) . '|' . $r->ip()));

        RateLimiter::for('auth-reset', function (Request $r) {
            return Limit::perMinutes(10, 5)->by(strtolower($r->input('email', '')) . '|' . $r->ip());
        });

        RateLimiter::for('auth-social', fn(Request $r) => Limit::perHour(10)->by($r->ip()));

        RateLimiter::for('auth-logout', fn(Request $r) => Limit::perMinute(10)->by($r->user()?->id ?? $r->ip()));

        RateLimiter::for('auth-change-password', fn(Request $r) => Limit::perMinutes(10, 5)->by($r->user()?->id ?? $r->ip()));

        RateLimiter::for('auth-onboarding', fn(Request $r) => Limit::perHour(20)->by($r->user()?->id ?? $r->ip()));

        RateLimiter::for('auth-mfa-setup', fn(Request $r) => Limit::perMinutes(10, 5)->by($r->user()?->id ?? $r->ip()));

        RateLimiter::for('auth-mfa-verify', function (Request $r) {
            return Limit::perMinutes(10, 5)->by(session('2fa:user_id') ?? $r->ip());
        });




        // MODULE 02 User Profle Rate limits
        RateLimiter::for('profile-update', fn(Request $r) => Limit::perMinutes(10, 30)->by($r->user()?->id ?? $r->ip()));

        RateLimiter::for('email-change-start', fn(Request $r) => Limit::perHour(5)->by($r->user()?->id ?? $r->ip()));

        RateLimiter::for('email-change-verify', function (Request $r) {
            return Limit::perMinutes(10, 10)->by($r->user()?->id ?? $r->ip());
        });


        // MODULE 03 Agents Rate limits
        RateLimiter::for('agent-wizard', fn(Request $r) => Limit::perMinutes(10, 60)->by($r->user()?->id ?? $r->ip()));
        RateLimiter::for('agent-public', fn(Request $r) => Limit::perMinute(120)->by($r->ip()));


        // MODULE 04 Agents Rate limits
        RateLimiter::for('service-public', fn(Request $r) => Limit::perMinute(120)->by($r->ip()));
        RateLimiter::for('service-wizard', fn(Request $r) => Limit::perMinutes(10, 60)->by($r->user()?->id ?? $r->ip()));
    }
}
