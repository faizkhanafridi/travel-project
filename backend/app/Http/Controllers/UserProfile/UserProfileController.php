<?php

namespace App\Http\Controllers\UserProfile;

use App\Http\Controllers\Controller;
use App\Http\Requests\UserProfile\CreateUserProfileRequest;
use App\Http\Requests\UserProfile\UpdatePhotoRequest;
use App\Http\Requests\UserProfile\UpdateUserProfileRequest;
use App\Http\Resources\UserProfile\UserProfileResource;
use App\Services\UserProfile\UserProfileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class UserProfileController extends Controller
{
    public function __construct(
        private UserProfileService $profileService,
    ) {}

    // GET /api/profile — returns the authenticated user's profile (or null).
    public function show(Request $request): JsonResponse
    {
        $profile = $this->profileService->forUser($request->user());

        return response()->json([
            'success' => true,
            'message' => $profile ? 'Profile retrieved.' : 'No profile created yet.',
            'data' => $profile ? new UserProfileResource($profile->load('languages', 'user')) : null,
        ]);
    }

    // POST /api/profile — create profile (idempotent: will create or update).
    public function store(CreateUserProfileRequest $request): JsonResponse
    {
        $profile = $this->profileService->createOrUpdate(
            $request->user(),
            $request->safe()->except(['language_ids', 'photo']),
            $request->input('language_ids', []),
            $request->file('photo'),
        );

        return response()->json([
            'success' => true,
            'message' => 'Profile saved.',
            'data' => new UserProfileResource($profile->load('languages', 'user')),
        ]);
    }

    // PUT /api/profile — update existing profile.
    public function update(UpdateUserProfileRequest $request): JsonResponse
    {
        if (! $this->profileService->forUser($request->user())) {
            throw ValidationException::withMessages([
                'profile' => ['No profile exists. Create one first.'],
            ]);
        }

        $profile = $this->profileService->createOrUpdate(
            $request->user(),
            $request->safe()->except(['language_ids', 'photo']),
            $request->input('language_ids', []),
            $request->file('photo'),
        );

        return response()->json([
            'success' => true,
            'message' => 'Profile updated.',
            'data' => new UserProfileResource($profile->load('languages', 'user')),
        ]);
    }

    // POST /api/profile/photo — replace photo.
    public function updatePhoto(UpdatePhotoRequest $request): JsonResponse
    {
        $profile = $this->profileService->updatePhoto($request->user(), $request->file('photo'));

        return response()->json([
            'success' => true,
            'message' => 'Photo updated.',
            'data' => new UserProfileResource($profile->load('languages', 'user')),
        ]);
    }

    // DELETE /api/profile/photo — remove photo.
    public function destroyPhoto(Request $request): JsonResponse
    {
        $profile = $this->profileService->removePhoto($request->user());

        return response()->json([
            'success' => true,
            'message' => 'Photo removed.',
            'data' => new UserProfileResource($profile->load('languages', 'user')),
        ]);
    }
}