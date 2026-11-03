<?php

use App\Http\Controllers\Auth\SocialAuthController;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => response()->json(['status' => 'ok']));

Route::prefix('api/auth')->group(function () {
    Route::get('social/{provider}/redirect', [SocialAuthController::class, 'redirect'])
        ->middleware('throttle:auth-social');

    Route::get('social/{provider}/callback', [SocialAuthController::class, 'callback']);
});

