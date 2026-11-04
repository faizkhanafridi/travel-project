<?php
// app/Http/Controllers/TravelPost/ConnectController.php

namespace App\Http\Controllers\TravelPost;

use App\Http\Controllers\Controller;
use App\Http\Resources\TravelPost\ConnectPackageResource;
use App\Models\Agent\Agent;
use App\Services\TravelPost\ConnectService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ConnectController extends Controller
{
    public function __construct(private ConnectService $connects) {}

    public function packages(): JsonResponse
    {
        return ConnectPackageResource::collection($this->connects->packages())->response();
    }

    public function balance(Request $request): JsonResponse
    {
        $agent = Agent::where('user_id', $request->user()->id)->first();
        abort_unless($agent, 403, 'Only agents have connects.');

        return response()->json([
            'balance' => $agent->connects_balance,
            'granted_once' => $agent->connects_awarded,
        ]);
    }

    public function buy(Request $request): JsonResponse
    {
        // Finance module not yet built — deliberately return a stub.
        return response()->json([
            'message' => 'Module Finance Coming Soon',
            'status' => 'pending_finance',
        ], 200);
    }
}