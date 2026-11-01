<?php
// routes/agent.php

use App\Http\Controllers\Agent\Admin\AdminAgentController;
use App\Http\Controllers\Agent\AgentApprovedController;
use App\Http\Controllers\Agent\AgentDocumentController;
use App\Http\Controllers\Agent\AgentWizardController;
use App\Http\Controllers\Agent\PublicAgentController;
use Illuminate\Support\Facades\Route;

// Public
Route::get('public', [PublicAgentController::class, 'index'])->middleware('throttle:agent-public');
Route::get('public/{uuid}', [PublicAgentController::class, 'show'])->middleware('throttle:agent-public');

// Authenticated (customer applying for agent)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('wizard', [AgentWizardController::class, 'show']);

    Route::prefix('wizard')->middleware('throttle:agent-wizard')->group(function () {
        Route::post('agency', [AgentWizardController::class, 'saveAgency']);
        Route::post('business', [AgentWizardController::class, 'saveBusiness']);
        Route::post('documents', [AgentWizardController::class, 'uploadDocuments']);
        Route::post('hours', [AgentWizardController::class, 'saveHours']);
        Route::post('submit', [AgentWizardController::class, 'submit']);
    });

    Route::get('documents/{document:uuid}', [AgentDocumentController::class, 'download']);



       Route::prefix('account')->middleware('role:agent')->group(function () {
        Route::get('/', [AgentApprovedController::class, 'show']);
        Route::patch('agency', [AgentApprovedController::class, 'updateAgency']);
        Route::patch('business', [AgentApprovedController::class, 'updateBusiness']);
        Route::patch('hours', [AgentApprovedController::class, 'updateHours']);
    });
});

// Admin
Route::middleware(['auth:sanctum', 'role:super_admin'])
    ->prefix('admin')
    ->group(function () {
        Route::get('applications', [AdminAgentController::class, 'index']);
        Route::get('applications/{uuid}', [AdminAgentController::class, 'show']);
        Route::post('applications/{uuid}/under-review', [AdminAgentController::class, 'markUnderReview']);
        Route::post('applications/{uuid}/approve', [AdminAgentController::class, 'approve']);
        Route::post('applications/{uuid}/reject', [AdminAgentController::class, 'reject']);
    });