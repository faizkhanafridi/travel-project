<?php

namespace App\Http\Controllers\UserProfile;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserProfile\PublicUserProfileResource;
use App\Services\UserProfile\UserProfileService;
use Illuminate\Http\JsonResponse;

class PublicProfileController extends Controller
{
    public function __construct(
        private UserProfileService $profileService,
    ) {}

    // GET /api/u/{username} — public customer profile. NEVER returns private fields.
    public function show(string $username): JsonResponse
    {
        $profile = $this->profileService->findByUsername($username);

        abort_unless($profile, 404, 'Profile not found.');

        // Agent public profiles belong to Module 03 — not exposed here.
        if ($profile->user?->hasRole('agent')) {
            abort(404, 'Profile not found.');
        }

        return response()->json([
            'success' => true,
            'message' => 'Public profile retrieved.',
            'data' => new PublicUserProfileResource($profile->load('languages', 'user')),
        ]);
    }
}