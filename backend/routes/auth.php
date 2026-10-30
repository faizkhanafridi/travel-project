<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\OnboardingController;
use App\Http\Controllers\Auth\PasswordController;
use App\Http\Controllers\Auth\RegistrationController;
use Illuminate\Support\Facades\Route;

// Public authentication endpoints.
Route::prefix('auth')->group(function () {
    // Registration + verification (no users row created until verified).
    Route::post('/register', [RegistrationController::class, 'register'])
        ->middleware('throttle:auth.registration');
    Route::post('/verify-email', [RegistrationController::class, 'verify'])
        ->middleware('throttle:auth.verify');
    Route::post('/resend-verification', [RegistrationController::class, 'resend'])
        ->middleware('throttle:auth.registration');

    // Login / logout / me.
    Route::post('/login', [LoginController::class, 'login'])
        ->middleware('throttle:auth.login');

    // Password reset.
Route::post('/forgot-password', [PasswordController::class, 'forgot'])
    ->middleware('throttle:auth.registration');
Route::post('/reset-password', [PasswordController::class, 'reset'])
    ->middleware('throttle:auth.registration');
Route::post('/set-password-with-token', [PasswordController::class, 'setWithToken'])
    ->middleware('throttle:auth.registration');
    // // Social login (Google / Facebook).
    // Route::get('/social/{provider}/redirect', [SocialAuthController::class, 'redirect'])
    //     ->middleware('throttle:auth.social');
    // Route::get('/social/{provider}/callback', [SocialAuthController::class, 'callback'])
    //     ->middleware('throttle:auth.social');

    // Authenticated endpoints.
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [LoginController::class, 'me']);
        Route::post('/logout', [LoginController::class, 'logout']);
        Route::post('/onboarding/choose-role', [OnboardingController::class, 'chooseRole']);
        Route::post('/change-password', [PasswordController::class, 'change']);
            Route::post('/set-password', [PasswordController::class, 'set']);
    
    });
});
