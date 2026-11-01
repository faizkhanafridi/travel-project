<?php
// app/Models/UserProfile/Profile.php

namespace App\Models\UserProfile;

use App\Models\Auth\User;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Profile extends Model
{
    use HasUuids;

    protected $fillable = [
        'uuid',
        'user_id',
        // 'display_name',
        'photo_path',
        'bio',
        'phone',
        'date_of_birth',
        'address_line',
        'city',
        'country',
        'languages',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'languages' => 'array',
        ];
    }

    // Override: only the uuid column is auto-generated, id stays auto-increment
    public function uniqueIds(): array
    {
        return ['uuid'];
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}