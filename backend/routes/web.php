<?php

use Illuminate\Support\Facades\Route;


use App\Http\Controllers\Auth\SocialAuthController;


Route::get('/', function () {
    return view('welcome');
});

Route::prefix('api/auth/social')->group(function () {
    Route::get('/{provider}/redirect', [SocialAuthController::class, 'redirect'])
        ->middleware('throttle:auth.social');

    Route::get('/{provider}/callback', [SocialAuthController::class, 'callback'])
        ->middleware('throttle:auth.social');
});