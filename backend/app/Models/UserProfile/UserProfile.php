<?php

namespace App\Models\UserProfile;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UserProfile extends Model
{
    protected $fillable = [
        'uuid',
        'user_id',
        'username',
        'display_name',
        'profile_photo_path',
        'bio',
        'phone',
        'date_of_birth',
        'address',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
    ];

    protected $appends = [
        'profile_photo_url',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $profile) {
            $profile->uuid ??= (string) Str::uuid();
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function languages(): BelongsToMany
{
    return $this->belongsToMany(
        Language::class,
        'user_profile_language', // explicit pivot table name (matches your migration)
        'user_profile_id',
        'language_id',
    )->withTimestamps();
}
    public function getProfilePhotoUrlAttribute(): ?string
    {
        if (! $this->profile_photo_path) {
            return null;
        }

        return Storage::disk(config('filesystems.profile_photo_disk', 'public'))
            ->url($this->profile_photo_path);
    }
}