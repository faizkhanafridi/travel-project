<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\Auth\SocialAuthService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class SocialAuthController extends Controller
{
    public function __construct(
        private SocialAuthService $socialAuthService,
    ) {}

    public function redirect(string $provider): RedirectResponse
    {
        $this->ensureSupported($provider);

        return $this->socialAuthService->redirect($provider);
    }

    public function callback(string $provider, Request $request): RedirectResponse
    {
        $this->ensureSupported($provider);

        $user = $this->socialAuthService->callback($provider);

        Auth::guard('web')->login($user);
        $request->session()->regenerate();

        // Redirect to SPA; onboarding is decided on the frontend via /auth/me.
        return redirect()->away(
            rtrim(config('app.frontend_url', env('FRONTEND_URL')), '/').'/auth/social/callback'
        );
    }

    private function ensureSupported(string $provider): void
    {
        abort_unless(in_array($provider, ['google', 'facebook'], true), 404);
    }
}