<?php

namespace App\Services\UserProfile;

use App\Models\User;
use App\Models\UserProfile\UserProfile;
use App\Repositories\Contracts\UserProfile\LanguageRepositoryInterface;
use App\Repositories\Contracts\UserProfile\UserProfileRepositoryInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class UserProfileService
{
    public function __construct(
        private UserProfileRepositoryInterface $profileRepo,
        private LanguageRepositoryInterface $languageRepo,
    ) {}

    public function forUser(User $user): ?UserProfile
    {
        return $this->profileRepo->findByUser($user);
    }

    public function findByUsername(string $username): ?UserProfile
    {
        return $this->profileRepo->findByUsername($username);
    }

    public function createOrUpdate(User $user, array $data, array $languageIds = [], ?UploadedFile $photo = null): UserProfile
    {
        // Username uniqueness check (against other profiles).
        $existing = $this->profileRepo->findByUser($user);
        if ($this->profileRepo->usernameExists($data['username'], $existing?->id)) {
            throw ValidationException::withMessages([
                'username' => ['This username is already taken.'],
            ]);
        }

        // Validate languages exist.
        $validIds = $this->languageRepo->existingIds($languageIds);
        if (count($validIds) !== count($languageIds)) {
            throw ValidationException::withMessages([
                'language_ids' => ['One or more selected languages are invalid.'],
            ]);
        }

        return DB::transaction(function () use ($user, $data, $validIds, $photo, $existing) {
            if ($photo) {
                $path = $this->storePhoto($photo);

                // Delete previous photo after successful write.
                if ($existing?->profile_photo_path) {
                    Storage::disk(config('filesystems.profile_photo_disk', 'public'))
                        ->delete($existing->profile_photo_path);
                }

                $data['profile_photo_path'] = $path;
            }

            $profile = $existing
                ? $this->profileRepo->update($existing, $data)
                : $this->profileRepo->create($user, $data);

            $this->profileRepo->syncLanguages($profile, $validIds);

            return $profile->fresh('languages');
        });
    }

    public function updatePhoto(User $user, UploadedFile $photo): UserProfile
    {
        $profile = $this->profileRepo->findByUser($user);

        if (! $profile) {
            throw ValidationException::withMessages([
                'photo' => ['Create your profile before uploading a photo.'],
            ]);
        }

        return DB::transaction(function () use ($profile, $photo) {
            $path = $this->storePhoto($photo);

            if ($profile->profile_photo_path) {
                Storage::disk(config('filesystems.profile_photo_disk', 'public'))
                    ->delete($profile->profile_photo_path);
            }

            return $this->profileRepo->update($profile, ['profile_photo_path' => $path]);
        });
    }

    public function removePhoto(User $user): UserProfile
    {
        $profile = $this->profileRepo->findByUser($user);

        if (! $profile) {
            throw ValidationException::withMessages([
                'photo' => ['No profile found.'],
            ]);
        }

        if ($profile->profile_photo_path) {
            Storage::disk(config('filesystems.profile_photo_disk', 'public'))
                ->delete($profile->profile_photo_path);
        }

        return $this->profileRepo->update($profile, ['profile_photo_path' => null]);
    }

    private function storePhoto(UploadedFile $photo): string
    {
        $disk = config('filesystems.profile_photo_disk', 'public');
        $path = config('filesystems.profile_photo_path', 'user-profiles/photos');

        // store() generates a random filename — never trust the client filename.
        return $photo->store($path, $disk);
    }
}