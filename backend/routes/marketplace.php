<?php
// routes/marketplace.php

use App\Http\Controllers\Marketplace\MarketplaceController;
use Illuminate\Support\Facades\Route;

Route::get('filters', [MarketplaceController::class, 'filters'])
    ->middleware('throttle:marketplace-public');

Route::get('/', [MarketplaceController::class, 'index'])
    ->middleware('throttle:marketplace-public');