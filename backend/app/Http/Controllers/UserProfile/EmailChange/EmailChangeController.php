<?php
// app/Http/Controllers/UserProfile/EmailChange/EmailChangeController.php

namespace App\Http\Controllers\UserProfile\EmailChange;

use App\Http\Controllers\Controller;
use App\Http\Requests\UserProfile\EmailChange\StartEmailChangeRequest;
use App\Http\Requests\UserProfile\EmailChange\StartEmailChangeWithPasswordRequest;
use App\Http\Requests\UserProfile\EmailChange\VerifyCurrentEmailRequest;
use App\Http\Requests\UserProfile\EmailChange\VerifyNewEmailRequest;
use App\Http\Resources\Auth\AuthUserResource;
use App\Http\Resources\UserProfile\EmailChange\EmailChangeRequestResource;
use App\Services\UserProfile\EmailChange\EmailChangeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmailChangeController extends Controller
{
    public function __construct(private EmailChangeService $service) {}

    public function start(StartEmailChangeRequest $request): JsonResponse
    {
        $emailChange = $this->service->startStandard(
            $request->user(),
            (string) $request->string('new_email'),
        );

        return (new EmailChangeRequestResource($emailChange))->response()->setStatusCode(201);
    }

    public function startWithPassword(StartEmailChangeWithPasswordRequest $request): JsonResponse
    {
        $emailChange = $this->service->startWithPassword(
            $request->user(),
            (string) $request->string('new_email'),
            (string) $request->string('current_password'),
        );

        return (new EmailChangeRequestResource($emailChange))->response()->setStatusCode(201);
    }

    public function verifyCurrent(VerifyCurrentEmailRequest $request): JsonResponse
    {
        $emailChange = $this->service->verifyCurrentEmail(
            $request->user(),
            (string) $request->string('code'),
        );

        return (new EmailChangeRequestResource($emailChange))->response();
    }

    public function verifyNew(VerifyNewEmailRequest $request): JsonResponse
    {
        $user = $this->service->verifyNewEmail(
            $request->user(),
            (string) $request->string('code'),
        );

        return (new AuthUserResource($user))->response();
    }

    public function status(Request $request): JsonResponse
    {
        $active = $this->service->status($request->user());

        if (! $active) {
            return response()->json(['data' => null]);
        }

        return (new EmailChangeRequestResource($active))->response();
    }

    public function cancel(Request $request): JsonResponse
    {
        $this->service->cancel($request->user());
        return response()->json(['message' => 'Email change request cancelled.']);
    }
}