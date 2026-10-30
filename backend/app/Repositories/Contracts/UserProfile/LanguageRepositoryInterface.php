<?php

namespace App\Repositories\Contracts\UserProfile;

use Illuminate\Support\Collection;

interface LanguageRepositoryInterface
{
    public function all(): Collection;

    public function existingIds(array $ids): array;
}