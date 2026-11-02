<?php
// routes/travel-service.php

use App\Http\Controllers\Currency\CurrencyController;
use App\Http\Controllers\TravelService\Admin\AdminServiceController;
use App\Http\Controllers\TravelService\PublicServiceController;
use App\Http\Controllers\TravelService\ServiceCategoryController;
use App\Http\Controllers\TravelService\TravelServiceWizardController;
use Illuminate\Support\Facades\Route;

// ========================
// Public — specific paths FIRST
// ========================
Route::get('categories', [ServiceCategoryController::class, 'index']);
Route::get('navigation', [PublicServiceController::class, 'navigation']);
Route::get('images/{uuid}', [PublicServiceController::class, 'image']);

Route::prefix('currency')->group(function () {
    Route::get('/', [CurrencyController::class, 'index']);
    Route::post('convert', [CurrencyController::class, 'convert']);
});

// Agent wizard routes — MUST be before the {uuid} wildcard
Route::middleware('auth:sanctum')->group(function () {
    Route::get('mine', [TravelServiceWizardController::class, 'index']);
    Route::post('mine', [TravelServiceWizardController::class, 'create'])->middleware('throttle:service-wizard');

    Route::prefix('mine/{uuid}')->middleware('throttle:service-wizard')->group(function () {
        Route::get('/', [TravelServiceWizardController::class, 'show']);
        Route::post('basic', [TravelServiceWizardController::class, 'saveBasic']);
        Route::post('details', [TravelServiceWizardController::class, 'saveDetails']);
        Route::post('gallery', [TravelServiceWizardController::class, 'uploadGallery']);
        Route::patch('gallery', [TravelServiceWizardController::class, 'reorderGallery']);
        Route::delete('gallery/{imageUuid}', [TravelServiceWizardController::class, 'deleteImage']);
        Route::post('requirements', [TravelServiceWizardController::class, 'saveRequirements']);
        Route::post('submit', [TravelServiceWizardController::class, 'submit']);
        Route::post('request-republish', [TravelServiceWizardController::class, 'requestRepublish']);
        Route::delete('/', [TravelServiceWizardController::class, 'destroy']);
    });
});

// Admin — specific prefix, also before {uuid} wildcard
Route::middleware(['auth:sanctum', 'role:super_admin'])->prefix('admin')->group(function () {
    Route::get('services', [AdminServiceController::class, 'index']);
    Route::get('services/{uuid}', [AdminServiceController::class, 'show']);
    Route::post('services/{uuid}/under-review', [AdminServiceController::class, 'markUnderReview']);
    Route::post('services/{uuid}/approve', [AdminServiceController::class, 'approve']);
    Route::post('services/{uuid}/reject', [AdminServiceController::class, 'reject']);
    Route::post('services/{uuid}/unpublish', [AdminServiceController::class, 'unpublish']);
    Route::post('services/{uuid}/suspend', [AdminServiceController::class, 'suspend']);
    Route::post('services/{uuid}/unsuspend', [AdminServiceController::class, 'unsuspend']);
    Route::post('republish-requests/{uuid}/approve', [AdminServiceController::class, 'approveRepublish']);
    Route::post('republish-requests/{uuid}/reject', [AdminServiceController::class, 'rejectRepublish']);
});

// ========================
// Public wildcard LAST — catches every remaining /api/services/{uuid}
// ========================
Route::get('/', [PublicServiceController::class, 'index'])->middleware('throttle:service-public');
Route::get('{uuid}', [PublicServiceController::class, 'show'])->middleware('throttle:service-public');