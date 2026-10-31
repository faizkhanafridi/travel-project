<?php
// app/Http/Controllers/Auth/MfaController.php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\MfaVerifyRequest;
use App\Http\Resources\Auth\AuthUserResource;
use App\Services\Auth\MfaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MfaController extends Controller
{
    public function __construct(private MfaService $service) {}

    public function setup(Request $request): JsonResponse
    {
        $data = $this->service->setup($request->user());
        return response()->json($data);
    }

    public function confirm(MfaVerifyRequest $request): JsonResponse
    {
        $this->service->confirm($request->user(), $request->string('code'));
        return response()->json(['message' => 'MFA enabled.']);
    }

    public function verify(MfaVerifyRequest $request): JsonResponse
    {
        $user = $this->service->verifyChallenge($request->string('code'));
        return (new AuthUserResource($user))->response();
    }

    public function disable(Request $request): JsonResponse
    {
        $this->service->disable($request->user());
        return response()->json(['message' => 'MFA disabled.']);
    }
}