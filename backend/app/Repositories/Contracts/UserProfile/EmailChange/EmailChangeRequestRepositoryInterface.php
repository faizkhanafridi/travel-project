<?php
// app/Repositories/Contracts/UserProfile/EmailChange/EmailChangeRequestRepositoryInterface.php

namespace App\Repositories\Contracts\UserProfile\EmailChange;

use App\Models\Auth\User;
use App\Models\UserProfile\EmailChange\EmailChangeRequest;

interface EmailChangeRequestRepositoryInterface
{
    public function findActiveForUser(User $user): ?EmailChangeRequest;

    public function findByUuid(string $uuid): ?EmailChangeRequest;

    public function create(array $data): EmailChangeRequest;

    public function update(EmailChangeRequest $request, array $data): EmailChangeRequest;

    public function delete(EmailChangeRequest $request): void;
}