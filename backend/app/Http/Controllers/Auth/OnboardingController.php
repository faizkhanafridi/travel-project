<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ChooseRoleRequest;
use App\Http\Resources\Auth\UserResource;
use App\Services\Auth\OnboardingService;
use Illuminate\Http\JsonResponse;

class OnboardingController extends Controller
{
    public function __construct(
        private OnboardingService $onboardingService,
    ) {}

    public function chooseRole(ChooseRoleRequest $request): JsonResponse
    {
        $user = $this->onboardingService->chooseRole(
            $request->user(),
            $request->string('account_type')->toString(),
        );

        return response()->json([
            'success' => true,
            'message' => 'Onboarding completed. Please set up your profile.',
            'data' => new UserResource($user),
        ]);
    }
}