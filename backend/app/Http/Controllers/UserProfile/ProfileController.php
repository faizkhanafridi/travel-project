<?php
// app/Http/Controllers/UserProfile/ProfileController.php

namespace App\Http\Controllers\UserProfile;

use App\Http\Controllers\Controller;
use App\Http\Requests\UserProfile\UpdateProfileRequest;
use App\Http\Resources\UserProfile\ProfileResource;
use App\Http\Resources\UserProfile\PublicProfileResource;
use App\Services\UserProfile\ProfileService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function __construct(private ProfileService $service) {}

    public function show(Request $request): JsonResponse
    {
        $profile = $this->service->show($request->user());

        if (! $profile) {
            return response()->json(['data' => null]);
        }

        return (new ProfileResource($profile->load('user.roles')))->response();
    }

 public function update(UpdateProfileRequest $request): JsonResponse
{
    Log::info('profile.update payload', [
        'has_file' => $request->hasFile('photo'),
        'remove_photo_raw' => $request->input('remove_photo'),
        'validated' => $request->validated(),
    ]);

    $profile = $this->service->upsert(
        $request->user(),
        $request->safe()->except(['photo']),
        $request->file('photo'),
    );

    return (new ProfileResource($profile->load('user.roles')))->response();
}

    public function publicShow(string $uuid): JsonResponse
    {
        $profile = $this->service->publicShow($uuid);

        if (! $profile) {
            return response()->json(['message' => 'Profile not found.'], 404);
        }

        return (new PublicProfileResource($profile->load('user.roles')))->response();
    }

    public function photo(string $uuid)
    {
        $profile = $this->service->publicShow($uuid);

        if (! $profile || ! $profile->photo_path) {
            return response()->json(['message' => 'Photo not found.'], 404);
        }

        $disk = Storage::disk('private');
        if (! $disk->exists($profile->photo_path)) {
            return response()->json(['message' => 'Photo not found.'], 404);
        }

        return $disk->response($profile->photo_path);
    }
}