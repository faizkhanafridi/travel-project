<?php
// routes/auth.php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Auth\MfaController;
use App\Http\Controllers\Auth\OnboardingController;
use App\Http\Controllers\Auth\PasswordController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\SocialAuthController;
use Illuminate\Support\Facades\Route;

// Public
Route::post('register', [RegisterController::class, 'register'])->middleware('throttle:auth-register');
Route::post('verify-email', [RegisterController::class, 'verify'])->middleware('throttle:auth-verify');
Route::post('resend-verification', [RegisterController::class, 'resend'])->middleware('throttle:auth-resend');
Route::post('login', [LoginController::class, 'login'])->middleware('throttle:auth-login');
Route::post('forgot-password', [PasswordController::class, 'forgot'])->middleware('throttle:auth-forgot');
Route::post('reset-password', [PasswordController::class, 'reset'])->middleware('throttle:auth-reset');
Route::post('set-password', [PasswordController::class, 'setPassword'])->middleware('throttle:auth-reset');



// MFA challenge (still unauthenticated, session-based pending state)
Route::post('mfa/verify', [MfaController::class, 'verify'])->middleware('throttle:auth-mfa-verify');

// Social
Route::get('social/{provider}/redirect', [SocialAuthController::class, 'redirect'])->middleware('throttle:auth-social');
Route::get('social/{provider}/callback', [SocialAuthController::class, 'callback']);

// Authenticated
Route::middleware('auth:sanctum')->group(function () {
    Route::get('me', [LoginController::class, 'me']);
    Route::post('logout', LogoutController::class)->middleware('throttle:auth-logout');

    Route::post('change-password', [PasswordController::class, 'change'])
        ->middleware('throttle:auth-change-password');

    // Onboarding
    Route::post('onboarding/choose-role', [OnboardingController::class, 'chooseRole'])
        ->middleware('throttle:auth-onboarding');
    Route::post('onboarding/skip', [OnboardingController::class, 'skip'])
        ->middleware('throttle:auth-onboarding');

    // MFA management
    Route::post('mfa/setup', [MfaController::class, 'setup'])->middleware('throttle:auth-mfa-setup');
    Route::post('mfa/confirm', [MfaController::class, 'confirm'])->middleware('throttle:auth-mfa-setup');
    Route::post('mfa/disable', [MfaController::class, 'disable'])->middleware('throttle:auth-mfa-setup');
});