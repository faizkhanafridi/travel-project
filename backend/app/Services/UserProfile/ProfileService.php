<?php
// app/Services/UserProfile/ProfileService.php

namespace App\Services\UserProfile;

use App\Models\Auth\User;
use App\Models\UserProfile\Profile;
use App\Repositories\Contracts\UserProfile\ProfileRepositoryInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class ProfileService
{
    public function __construct(private ProfileRepositoryInterface $profiles) {}

    public function show(User $user): ?Profile
    {
        return $this->profiles->findByUser($user);
    }

    public function publicShow(string $uuid): ?Profile
    {
        return $this->profiles->findByUuid($uuid);
    }

        public function upsert(User $user, array $data, ?UploadedFile $photo): Profile
    {
        return DB::transaction(function () use ($user, $data, $photo) {
            // users.username — canonical handle, must remain unique
            if (! empty($data['username'])) {
                if ($this->profiles->usernameExists($data['username'], $user->id)) {
                    throw new UnprocessableEntityHttpException('Username is already taken.');
                }
                $user->forceFill(['username' => $data['username']])->save();
            }

            // users.name — canonical display name (works for social-login users too)
            if (! empty($data['name'])) {
                $user->forceFill(['name' => $data['name']])->save();
            }

            $profile = $this->profiles->findByUser($user);

            if ($photo) {
                $path = $this->storePhoto($user, $photo);
                $data['photo_path'] = $path;
                if ($profile?->photo_path && $profile->photo_path !== $path) {
                    Storage::disk('private')->delete($profile->photo_path);
                }
            }

            // Strip user-level fields — they do not belong on the profile row
            $profileData = $data;
            unset($profileData['username'], $profileData['name']);

            if ($profile) {
                return $this->profiles->update($profile, $profileData);
            }

            return $this->profiles->createForUser($user, $profileData);
        });
    }

    private function storePhoto(User $user, UploadedFile $photo): string
    {
        $filename = Str::uuid() . '.' . $photo->getClientOriginalExtension();

        return $photo->storeAs("profiles/{$user->uuid}", $filename, 'private');
    }
}