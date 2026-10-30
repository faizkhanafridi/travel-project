<?php

namespace App\Repositories\Eloquent\UserProfile;

use App\Models\User;
use App\Models\UserProfile\EmailChangeRequest;
use App\Repositories\Contracts\UserProfile\EmailChangeRequestRepositoryInterface;

class EmailChangeRequestRepository implements EmailChangeRequestRepositoryInterface
{
    public function activeForUser(User $user): ?EmailChangeRequest
    {
        return EmailChangeRequest::where('user_id', $user->id)->latest()->first();
    }

    public function create(User $user, array $data): EmailChangeRequest
    {
        return EmailChangeRequest::create(array_merge($data, ['user_id' => $user->id]));
    }

    public function update(EmailChangeRequest $request, array $data): EmailChangeRequest
    {
        $request->update($data);

        return $request->refresh();
    }

    public function delete(EmailChangeRequest $request): void
    {
        $request->delete();
    }
}