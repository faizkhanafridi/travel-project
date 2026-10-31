<?php

use App\Http\Controllers\Agent\AgentApplicationController;
use App\Http\Controllers\Agent\AgentDocumentController;
use App\Http\Controllers\Agent\Admin\AdminAgentController;
use Illuminate\Support\Facades\Route;           

// Authenticated agent applicant endpoints.
Route::prefix('agent')->middleware('auth:sanctum')->group(function () {
    Route::get('/application', [AgentApplicationController::class, 'show']);
    Route::post('/application/start', [AgentApplicationController::class, 'start']);

    Route::put('/application/agency', [AgentApplicationController::class, 'saveAgency'])
        ->middleware('throttle:30,1');
    Route::put('/application/business', [AgentApplicationController::class, 'saveBusiness'])
        ->middleware('throttle:30,1');
    Route::put('/application/business-hours', [AgentApplicationController::class, 'saveHours'])
        ->middleware('throttle:30,1');

    Route::get('/application/review', [AgentApplicationController::class, 'review']);
    Route::post('/application/submit', [AgentApplicationController::class, 'submit'])
        ->middleware('throttle:10,1');

    Route::post('/documents', [AgentDocumentController::class, 'store'])
        ->middleware('throttle:20,1');
    Route::delete('/documents/{uuid}', [AgentDocumentController::class, 'destroy'])
        ->middleware('throttle:20,1');
    Route::get('/documents/{uuid}/download', [AgentDocumentController::class, 'download']);
});

// Admin (super_admin only) endpoints.
Route::prefix('admin/agents')
    ->middleware(['auth:sanctum', 'role:super_admin'])
    ->group(function () {
        Route::get('/', [AdminAgentController::class, 'index']);
        Route::get('/{uuid}', [AdminAgentController::class, 'show']);
        Route::post('/{uuid}/under-review', [AdminAgentController::class, 'markUnderReview'])
            ->middleware('throttle:30,1');
        Route::post('/{uuid}/approve', [AdminAgentController::class, 'approve'])
            ->middleware('throttle:10,1');
        Route::post('/{uuid}/reject', [AdminAgentController::class, 'reject'])
            ->middleware('throttle:10,1');
        Route::post('/{uuid}/suspend', [AdminAgentController::class, 'suspend'])
            ->middleware('throttle:10,1');
        Route::post('/{uuid}/unsuspend', [AdminAgentController::class, 'unsuspend'])
            ->middleware('throttle:10,1');
        Route::get('/{uuid}/documents/{docUuid}/download', [AdminAgentController::class, 'downloadDocument']);
    });