<?php
// app/Http/Controllers/Auth/LogoutController.php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\Auth\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LogoutController extends Controller
{
    public function __construct(private AuthService $auth) {}

    public function __invoke(Request $request): JsonResponse
    {
        $this->auth->logout();

        return response()->json(['message' => 'Logged out.']);
    }
}