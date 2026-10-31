<?php
// app/Http/Controllers/Auth/PasswordController.php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ChangePasswordRequest;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Requests\Auth\SetPasswordRequest;
use App\Services\Auth\PasswordResetService;
use Illuminate\Http\JsonResponse;

class PasswordController extends Controller
{
    public function __construct(private PasswordResetService $service) {}

    public function forgot(ForgotPasswordRequest $request): JsonResponse
    {
        $this->service->sendCode($request->string('email'));

        // Message stays generic — frontend can't tell reset vs set-password from here.
        return response()->json([
            'message' => 'If an account exists for this email, a code has been sent.',
        ]);
    }

    public function reset(ResetPasswordRequest $request): JsonResponse
    {
        $this->service->reset(
            $request->string('email'),
            $request->string('code'),
            $request->string('password'),
        );

        return response()->json(['message' => 'Password reset successfully. Please log in.']);
    }

    public function setPassword(SetPasswordRequest $request): JsonResponse
    {
        $this->service->setPassword(
            $request->string('email'),
            $request->string('code'),
            $request->string('password'),
        );

        return response()->json(['message' => 'Password set successfully. Please log in.']);
    }

    public function change(ChangePasswordRequest $request): JsonResponse
    {
        $this->service->changePassword(
            $request->user(),
            $request->string('current_password'),
            $request->string('password'),
        );

        return response()->json(['message' => 'Password updated successfully.']);
    }
}