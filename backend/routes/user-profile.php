<?php

use App\Http\Controllers\UserProfile\EmailChangeController;
use App\Http\Controllers\UserProfile\LanguageController;
use App\Http\Controllers\UserProfile\PublicProfileController;
use App\Http\Controllers\UserProfile\UserProfileController;
use Illuminate\Support\Facades\Route;

// Public: seeded language list for the profile form.
Route::get('/languages', [LanguageController::class, 'index']);

// Public: customer public profile (agent profiles served by Module 03).
Route::get('/u/{username}', [PublicProfileController::class, 'show']);

// Authenticated: own profile + email change.
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/profile', [UserProfileController::class, 'show']);
    Route::post('/profile', [UserProfileController::class, 'store'])
        ->middleware('throttle:profile.write');
    Route::put('/profile', [UserProfileController::class, 'update'])
        ->middleware('throttle:profile.write');
    Route::post('/profile/photo', [UserProfileController::class, 'updatePhoto'])
        ->middleware('throttle:profile.write');
    Route::delete('/profile/photo', [UserProfileController::class, 'destroyPhoto'])
        ->middleware('throttle:profile.write');

    Route::post('/profile/email/initiate', [EmailChangeController::class, 'initiate'])
        ->middleware('throttle:profile.email.change');
    Route::post('/profile/email/initiate-with-password', [EmailChangeController::class, 'initiateWithPassword'])
        ->middleware('throttle:profile.email.change');
    Route::post('/profile/email/verify-current', [EmailChangeController::class, 'verifyCurrent'])
        ->middleware('throttle:profile.email.verify');
    Route::post('/profile/email/verify-new', [EmailChangeController::class, 'verifyNew'])
        ->middleware('throttle:profile.email.verify');
});