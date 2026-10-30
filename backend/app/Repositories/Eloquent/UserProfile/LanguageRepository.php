<?php

namespace App\Repositories\Eloquent\UserProfile;

use App\Models\UserProfile\Language;
use App\Repositories\Contracts\UserProfile\LanguageRepositoryInterface;
use Illuminate\Support\Collection;

class LanguageRepository implements LanguageRepositoryInterface
{
    public function all(): Collection
    {
        return Language::orderBy('name')->get();
    }

    public function existingIds(array $ids): array
    {
        return Language::whereIn('id', $ids)->pluck('id')->all();
    }
}