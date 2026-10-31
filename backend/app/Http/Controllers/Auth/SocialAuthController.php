<?php
// app/Http/Controllers/Auth/SocialAuthController.php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\Auth\SocialAuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;

class SocialAuthController extends Controller
{
    public function __construct(private SocialAuthService $service) {}

    public function redirect(string $provider): JsonResponse
    {
        $this->assertProvider($provider);
        return response()->json(['url' => $this->service->redirectUrl($provider)]);
    }

    public function callback(string $provider): RedirectResponse
    {
        $this->assertProvider($provider);
        try {
            $this->service->handleCallback($provider);
            return redirect()->away(rtrim(config('app.frontend_url'), '/') . '/auth/social/success');
        } catch (\Throwable $e) {
            Log::warning('social login failed', ['provider' => $provider, 'error' => $e->getMessage()]);
            return redirect()->away(rtrim(config('app.frontend_url'), '/') . '/auth/social/error');
        }
    }

    private function assertProvider(string $provider): void
    {
        abort_unless(in_array($provider, ['google', 'facebook'], true), 404);
    }
}