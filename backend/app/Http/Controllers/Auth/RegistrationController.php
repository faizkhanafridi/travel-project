<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResendVerificationRequest;
use App\Http\Requests\Auth\VerifyEmailRequest;
use App\Http\Resources\Auth\UserResource;
use App\Services\Auth\RegistrationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class RegistrationController extends Controller
{
    public function __construct(
        private RegistrationService $registrationService,
    ) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $this->registrationService->register(
            $request->string('email')->toString(),
            $request->string('password')->toString(),
            $request->ip(),
        );

        return response()->json([
            'success' => true,
            'message' => 'A 6-digit verification code has been sent to your email.',
            'data' => null,
        ], 201);
    }

    public function verify(VerifyEmailRequest $request): JsonResponse
    {
        $user = $this->registrationService->verifyEmail(
            $request->string('email')->toString(),
            $request->string('code')->toString(),
        );

        Auth::guard('web')->login($user);
        $request->session()->regenerate();

        return response()->json([
            'success' => true,
            'message' => 'Email verified successfully. Welcome!',
            'data' => new UserResource($user),
        ]);
    }

    public function resend(ResendVerificationRequest $request): JsonResponse
    {
        $this->registrationService->resendVerification(
            $request->string('email')->toString(),
        );

        // Always return the same message to avoid enumeration.
        return response()->json([
            'success' => true,
            'message' => 'If this email is pending verification, a new code has been sent.',
            'data' => null,
        ]);
    }
}