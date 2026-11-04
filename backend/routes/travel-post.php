<?php
// routes/travel-post.php

use App\Http\Controllers\TravelPost\ConnectController;
use App\Http\Controllers\TravelPost\GlobalPostController;
use App\Http\Controllers\TravelPost\OfferController;
use App\Http\Controllers\TravelPost\ServiceTripRequestController;
use Illuminate\Support\Facades\Route;

// Public — browse open global posts
Route::get('posts', [GlobalPostController::class, 'index'])->middleware('throttle:travel-post-public');
Route::get('posts/{uuid}', [GlobalPostController::class, 'show'])->middleware('throttle:travel-post-public');

// Connects packages are public (prices shown on buy page)
Route::get('connects/packages', [ConnectController::class, 'packages'])->middleware('throttle:travel-post-public');

Route::middleware('auth:sanctum')->group(function () {
    // Customer
    Route::post('posts', [GlobalPostController::class, 'store'])->middleware('throttle:travel-post-create');
    Route::get('my/posts', [GlobalPostController::class, 'myIndex'])->middleware('throttle:travel-post-public');
    Route::post('posts/{uuid}/cancel', [GlobalPostController::class, 'cancel'])->middleware('throttle:travel-post-create');
    Route::get('posts/{uuid}/offers', [GlobalPostController::class, 'offers'])->middleware('throttle:travel-post-public');
    Route::post('services/{serviceUuid}/request-trip', [GlobalPostController::class, 'storeServiceRequest'])
        ->middleware('throttle:travel-post-create');

    // Agent
    Route::post('posts/{postUuid}/offers', [OfferController::class, 'submit'])->middleware('throttle:travel-post-offer');
    Route::get('my/offers', [OfferController::class, 'myOffers'])->middleware('throttle:travel-post-public');
    Route::post('offers/{uuid}/withdraw', [OfferController::class, 'withdraw'])->middleware('throttle:travel-post-offer');
    Route::get('agent/service-requests', [ServiceTripRequestController::class, 'agentIndex'])->middleware('throttle:travel-post-public');
    Route::get('agent/service-requests/{uuid}', [ServiceTripRequestController::class, 'show'])->middleware('throttle:travel-post-public');

    // Connects
    Route::get('connects/balance', [ConnectController::class, 'balance'])->middleware('throttle:travel-post-public');
    Route::post('connects/buy', [ConnectController::class, 'buy'])->middleware('throttle:travel-post-create');

    // Customer decides on offers
    Route::post('offers/{uuid}/decision', [OfferController::class, 'decide'])->middleware('throttle:travel-post-offer');
});