<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ChangePasswordRequest;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Services\Auth\PasswordResetService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class PasswordController extends Controller
{
    public function __construct(
        private PasswordResetService $passwordResetService,
    ) {}

public function forgot(ForgotPasswordRequest $request): JsonResponse
{
    $this->passwordResetService->sendResetOrSetLink(
        $request->string('email')->toString(),
    );

    return response()->json([
        'success' => true,
        'message' => 'If an account exists for this email, we have sent instructions.',
        'data' => null,
    ]);
}

    public function reset(ResetPasswordRequest $request): JsonResponse
    {
        $this->passwordResetService->reset(
            $request->string('email')->toString(),
            $request->string('token')->toString(),
            $request->string('password')->toString(),
        );

        return response()->json([
            'success' => true,
            'message' => 'Password reset successfully. Please log in with your new password.',
            'data' => null,
        ]);
    }

    public function change(ChangePasswordRequest $request): JsonResponse
    {
        $user = $request->user();

        if (! $user->hasPassword() || ! Hash::check($request->string('current_password')->toString(), $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        $user->forceFill(['password' => Hash::make($request->string('password')->toString())])->save();
        $user->tokens()->delete(); // invalidate any personal access tokens

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully.',
            'data' => null,
        ]);
    }


    public function set(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->hasPassword()) {
            throw ValidationException::withMessages([
                'password' => ['Your account already has a password. Use change-password instead.'],
            ]);
        }

        $user->forceFill(['password' => Hash::make($request->string('password')->toString())])->save();

        return response()->json([
            'success' => true,
            'message' => 'Password set successfully. You can now log in with email and password.',
            'data' => null,
        ]);
    }

    public function setWithToken(Request $request): JsonResponse
{
    $validated = $request->validate([
        'email' => ['required', 'string', 'email'],
        'token' => ['required', 'string'],
        'password' => ['required', 'string', 'min:8', 'confirmed'],
    ]);

    $this->passwordResetService->setPasswordWithToken(
        $validated['email'],
        $validated['token'],
        $validated['password'],
    );

    return response()->json([
        'success' => true,
        'message' => 'Password set successfully. You can now log in with email and password.',
        'data' => null,
    ]);
}
}
