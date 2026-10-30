<?php

namespace App\Repositories\Contracts\UserProfile;

use App\Models\User;
use App\Models\UserProfile\EmailChangeRequest;

interface EmailChangeRequestRepositoryInterface
{
    public function activeForUser(User $user): ?EmailChangeRequest;

    public function create(User $user, array $data): EmailChangeRequest;

    public function update(EmailChangeRequest $request, array $data): EmailChangeRequest;

    public function delete(EmailChangeRequest $request): void;
}