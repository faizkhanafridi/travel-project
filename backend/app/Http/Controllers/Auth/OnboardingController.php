<?php
// app/Http/Controllers/Auth/OnboardingController.php

namespace App\Http\Controllers\Auth;

use App\Enums\Auth\OnboardingChoice;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ChooseRoleRequest;
use App\Http\Resources\Auth\AuthUserResource;
use App\Services\Auth\OnboardingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OnboardingController extends Controller
{
    public function __construct(private OnboardingService $service) {}

    public function chooseRole(ChooseRoleRequest $request): JsonResponse
    {
        $user = $this->service->complete(
            $request->user(),
            OnboardingChoice::from($request->string('choice')),
        );

        return (new AuthUserResource($user))->response();
    }

    public function skip(Request $request): JsonResponse
    {
        $user = $this->service->skip($request->user());
        return (new AuthUserResource($user))->response();
    }
}