<?php
// routes/messaging.php

use App\Http\Controllers\Messaging\ConversationController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::get('conversations', [ConversationController::class, 'index'])
        ->middleware('throttle:messaging-list');
    Route::post('conversations', [ConversationController::class, 'start'])
        ->middleware('throttle:messaging-start');
    Route::get('conversations/{uuid}', [ConversationController::class, 'show'])
        ->middleware('throttle:messaging-list');
    Route::get('conversations/{uuid}/messages', [ConversationController::class, 'messages'])
        ->middleware('throttle:messaging-list');
    Route::post('conversations/{uuid}/messages', [ConversationController::class, 'send'])
        ->middleware('throttle:messaging-send');
    Route::post('conversations/{uuid}/read', [ConversationController::class, 'markRead'])
        ->middleware('throttle:messaging-list');
    Route::get('conversations/{uuid}/unread', [ConversationController::class, 'unread'])
        ->middleware('throttle:messaging-list');
});