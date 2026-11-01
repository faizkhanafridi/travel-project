<?php
// routes/user-profile.php

use App\Http\Controllers\UserProfile\EmailChange\EmailChangeController;
use App\Http\Controllers\UserProfile\ProfileController;
use Illuminate\Support\Facades\Route;

// Public
Route::get('public/{uuid}', [ProfileController::class, 'publicShow']);
Route::get('photo/{uuid}', [ProfileController::class, 'photo']);

// Authenticated
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/', [ProfileController::class, 'show']);
    Route::patch('/', [ProfileController::class, 'update'])->middleware('throttle:profile-update');

    Route::prefix('email')->group(function () {
        Route::get('status', [EmailChangeController::class, 'status']);
        Route::post('start', [EmailChangeController::class, 'start'])
            ->middleware('throttle:email-change-start');
        Route::post('start-with-password', [EmailChangeController::class, 'startWithPassword'])
            ->middleware('throttle:email-change-start');
        Route::post('verify-current', [EmailChangeController::class, 'verifyCurrent'])
            ->middleware('throttle:email-change-verify');
        Route::post('verify-new', [EmailChangeController::class, 'verifyNew'])
            ->middleware('throttle:email-change-verify');
        Route::delete('cancel', [EmailChangeController::class, 'cancel']);
    });
});