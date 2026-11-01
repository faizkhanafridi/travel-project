<?php
// app/Repositories/Eloquent/UserProfile/EmailChange/EmailChangeRequestRepository.php

namespace App\Repositories\Eloquent\UserProfile\EmailChange;

use App\Models\Auth\User;
use App\Models\UserProfile\EmailChange\EmailChangeRequest;
use App\Repositories\Contracts\UserProfile\EmailChange\EmailChangeRequestRepositoryInterface;
use Illuminate\Support\Str;

class EmailChangeRequestRepository implements EmailChangeRequestRepositoryInterface
{
    public function findActiveForUser(User $user): ?EmailChangeRequest
    {
        return EmailChangeRequest::where('user_id', $user->id)->latest('id')->first();
    }

    public function findByUuid(string $uuid): ?EmailChangeRequest
    {
        return EmailChangeRequest::where('uuid', $uuid)->first();
    }

    public function create(array $data): EmailChangeRequest
    {
        $data['uuid'] = $data['uuid'] ?? (string) Str::uuid();

        return EmailChangeRequest::create($data);
    }

    public function update(EmailChangeRequest $request, array $data): EmailChangeRequest
    {
        $request->fill($data)->save();

        return $request->fresh();
    }

    public function delete(EmailChangeRequest $request): void
    {
        $request->delete();
    }
}