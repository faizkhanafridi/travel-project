<?php
// app/Http/Controllers/Auth/RegisterController.php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResendVerificationRequest;
use App\Http\Requests\Auth\VerifyEmailRequest;
use App\Http\Resources\Auth\AuthUserResource;
use App\Services\Auth\RegistrationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class RegisterController extends Controller
{
    public function __construct(private RegistrationService $registration) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $this->registration->register(
            $request->string('name'),
            $request->string('email'),
            $request->string('password'),
            $request->ip(),
        );

        return response()->json([
            'message' => 'A verification code has been sent to your email.',
        ], 201);
    }

    public function resend(ResendVerificationRequest $request): JsonResponse
    {
        $this->registration->resend($request->string('email'));

        return response()->json([
            'message' => 'If an account exists for this email, a new code has been sent.',
        ]);
    }

    public function verify(VerifyEmailRequest $request): JsonResponse
    {
        $user = $this->registration->verify(
            $request->string('email'),
            $request->string('code'),
            $request->ip(),
        );

        Auth::login($user);
        $request->session()->regenerate();

        return (new AuthUserResource($user))->response()->setStatusCode(200);
    }
}