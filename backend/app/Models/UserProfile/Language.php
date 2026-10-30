<?php

namespace App\Models\UserProfile;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Language extends Model
{
    protected $fillable = [
        'uuid',
        'name',
        'code',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $language) {
            $language->uuid ??= (string) Str::uuid();
        });
    }
}