<?php
// app/Repositories/Eloquent/Agent/AgentRepository.php

namespace App\Repositories\Eloquent\Agent;

use App\Enums\Agent\AgentStatus;
use App\Models\Agent\Agent;
use App\Models\Auth\User;
use App\Repositories\Contracts\Agent\AgentRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

class AgentRepository implements AgentRepositoryInterface
{
    public function findByUser(User $user): ?Agent
    {
        return Agent::where('user_id', $user->id)->first();
    }

    public function findByUuid(string $uuid): ?Agent
    {
        return Agent::with(['user', 'profile', 'documents', 'businessHours'])->where('uuid', $uuid)->first();
    }

    public function createForUser(User $user): Agent
    {
        return Agent::create([
            'uuid' => (string) Str::uuid(),
            'user_id' => $user->id,
            'status' => AgentStatus::DRAFT->value,
            'attempt' => 0,
        ]);
    }

    public function update(Agent $agent, array $data): Agent
    {
        $agent->fill($data)->save();

        return $agent->fresh();
    }

    public function paginateForAdmin(array $filters): LengthAwarePaginator
    {
        $query = Agent::query()
            ->with(['user', 'profile'])
            ->latest('submitted_at');

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        } else {
            // default: only submitted applications
            $query->whereIn('status', [
                AgentStatus::PENDING_REVIEW->value,
                AgentStatus::UNDER_REVIEW->value,
                AgentStatus::APPROVED->value,
                AgentStatus::REJECTED->value,
            ]);
        }

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->whereHas('user', function ($u) use ($search) {
                    $u->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                })->orWhereHas('profile', function ($p) use ($search) {
                    $p->where('agency_name', 'like', "%{$search}%");
                });
            });
        }

        return $query->paginate((int) ($filters['per_page'] ?? 20));
    }

    public function paginateApproved(array $filters): LengthAwarePaginator
    {
        $query = Agent::query()
            ->with(['user', 'profile'])
            ->where('status', AgentStatus::APPROVED->value)
            ->latest('approved_at');

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->whereHas('profile', function ($p) use ($search) {
                    $p->where('agency_name', 'like', "%{$search}%");
                })->orWhereHas('user', function ($u) use ($search) {
                    $u->where('name', 'like', "%{$search}%");
                });
            });
        }

        return $query->paginate((int) ($filters['per_page'] ?? 20));
    }
}