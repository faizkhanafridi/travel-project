<?php
// app/Http/Controllers/Auth/LoginController.php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\Auth\AuthUserResource;
use App\Services\Auth\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LoginController extends Controller
{
    public function __construct(private AuthService $auth) {}

    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->auth->attempt(
            $request->string('email'),
            $request->string('password'),
            (bool) $request->boolean('remember'),
        );

        if ($result['requires_mfa']) {
            return response()->json([
                'requires_mfa' => true,
                'message' => 'Enter your two-factor authentication code.',
            ]);
        }

        return (new AuthUserResource($result['user']))->response();
    }

    public function me(Request $request): JsonResponse
    {
        // if user is in MFA-pending state, tell frontend
        if (session('2fa:user_id')) {
            return response()->json([
                'requires_mfa' => true,
                'message' => 'MFA verification required.',
            ], 401);
        }

        if (! $request->user()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        return (new AuthUserResource($request->user()))->response();
    }
}