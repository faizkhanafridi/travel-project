<?php

namespace App\Policies\Agent;

use App\Models\Agent\Agent;
use App\Models\User;

class AgentPolicy
{
    // User can view their own application only.
    public function view(User $user, Agent $agent): bool
    {
        return $user->id === $agent->user_id
            || $user->hasRole('super_admin');
    }

    // User can update own application only when editable (draft/rejected).
    public function update(User $user, Agent $agent): bool
    {
        return $user->id === $agent->user_id && $agent->isEditable();
    }

    // Only super_admin approves/rejects/suspends.
    public function review(User $user, Agent $agent): bool
    {
        return $user->hasRole('super_admin');
    }
}