<?php

namespace App\Http\Controllers\UserProfile;

use App\Http\Controllers\Controller;
use App\Http\Requests\UserProfile\InitiateEmailChangeRequest;
use App\Http\Requests\UserProfile\InitiateEmailChangeWithPasswordRequest;
use App\Http\Requests\UserProfile\VerifyEmailChangeCodeRequest;
use App\Http\Resources\Auth\UserResource;
use App\Services\UserProfile\EmailChangeService;
use Illuminate\Http\JsonResponse;

class EmailChangeController extends Controller
{
    public function __construct(
        private EmailChangeService $emailChangeService,
    ) {}

    // POST /api/profile/email/initiate — code goes to CURRENT email.
    public function initiate(InitiateEmailChangeRequest $request): JsonResponse
    {
        $this->emailChangeService->initiateWithCurrentEmail(
            $request->user(),
            $request->string('new_email')->toString(),
        );

        return response()->json([
            'success' => true,
            'message' => 'A 6-digit code has been sent to your current email address.',
            'data' => null,
        ]);
    }

    // POST /api/profile/email/initiate-with-password — alternative flow.
    public function initiateWithPassword(InitiateEmailChangeWithPasswordRequest $request): JsonResponse
    {
        $this->emailChangeService->initiateWithPassword(
            $request->user(),
            $request->string('new_email')->toString(),
            $request->string('current_password')->toString(),
        );

        return response()->json([
            'success' => true,
            'message' => 'A 6-digit code has been sent to your new email address.',
            'data' => null,
        ]);
    }

    // POST /api/profile/email/verify-current — verifies code sent to current email.
    public function verifyCurrent(VerifyEmailChangeCodeRequest $request): JsonResponse
    {
        $this->emailChangeService->verifyCurrentEmailCode(
            $request->user(),
            $request->string('code')->toString(),
        );

        return response()->json([
            'success' => true,
            'message' => 'Current email verified. A code has been sent to your new email address.',
            'data' => null,
        ]);
    }

    // POST /api/profile/email/verify-new — verifies code sent to new email; finalizes change.
    public function verifyNew(VerifyEmailChangeCodeRequest $request): JsonResponse
    {
        $user = $this->emailChangeService->verifyNewEmailCode(
            $request->user(),
            $request->string('code')->toString(),
        );

        return response()->json([
            'success' => true,
            'message' => 'Email address updated successfully.',
            'data' => new UserResource($user),
        ]);
    }
}