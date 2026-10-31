<?php

namespace App\Repositories\Eloquent\Agent;

use App\Enums\Agent\AgentStatus;
use App\Models\Agent\Agent;
use App\Models\Agent\AgentApplicationAttempt;
use App\Models\Agent\AgentApplicationEvent;
use App\Models\Agent\AgentProfile;
use App\Models\User;
use App\Repositories\Contracts\Agent\AgentRepositoryInterface;

class AgentRepository implements AgentRepositoryInterface
{
    public function findByUser(User $user): ?Agent
    {
        return Agent::where('user_id', $user->id)->first();
    }

    public function findByUuid(string $uuid): ?Agent
    {
        return Agent::where('uuid', $uuid)->first();
    }

    public function createForUser(User $user): Agent
    {
        return Agent::create([
            'user_id' => $user->id,
            'status' => AgentStatus::DRAFT,
            'current_attempt' => 0,
        ]);
    }

    public function update(Agent $agent, array $data): Agent
    {
        $agent->update($data);

        return $agent->refresh();
    }

    public function saveAgencyInfo(Agent $agent, array $data): void
    {
        AgentProfile::updateOrCreate(
            ['agent_id' => $agent->id],
            array_merge($data, ['agency_information_completed' => true]),
        );
    }

    public function saveBusinessInfo(Agent $agent, array $data): void
    {
        AgentProfile::updateOrCreate(
            ['agent_id' => $agent->id],
            array_merge($data, ['business_information_completed' => true]),
        );
    }

    public function replaceBusinessHours(Agent $agent, array $hours): void
    {
        $agent->businessHours()->delete();

        foreach ($hours as $hour) {
            $agent->businessHours()->create([
                'day_of_week' => (int) $hour['day_of_week'],
                'is_closed' => (bool) ($hour['is_closed'] ?? false),
                'open_time' => ($hour['is_closed'] ?? false) ? null : ($hour['open_time'] ?? null),
                'close_time' => ($hour['is_closed'] ?? false) ? null : ($hour['close_time'] ?? null),
            ]);
        }
    }

    public function addDocument(Agent $agent, array $data): void
    {
        $agent->documents()->create($data);
    }

    public function createAttempt(Agent $agent, array $data): void
    {
        AgentApplicationAttempt::create(array_merge($data, ['agent_id' => $agent->id]));
    }

    public function updateLatestAttempt(Agent $agent, array $data): void
    {
        $latest = $agent->attempts()->latest('attempt_number')->first();
        if ($latest) {
            $latest->update($data);
        }
    }

    public function markApprovedDocuments(Agent $agent): void
    {
        $agent->documents()->update(['is_approved' => true]);
    }

    public function logEvent(Agent $agent, array $data): void
    {
        AgentApplicationEvent::create(array_merge($data, ['agent_id' => $agent->id]));
    }

    public function paginateForAdmin(array $filters, int $perPage = 20)
    {
        return Agent::query()
            ->with([
                'user:id,uuid,email,account_type',
                'profile',
                'attempts' => fn ($q) => $q->latest('attempt_number')->limit(1),
            ])
            ->when($filters['status'] ?? null, fn ($q, $s) => $q->where('status', $s))
            ->when($filters['search'] ?? null, function ($q, $s) {
                $q->where(function ($inner) use ($s) {
                    $inner->whereHas('user', fn ($u) => $u->where('email', 'like', "%{$s}%"))
                        ->orWhereHas('profile', function ($p) use ($s) {
                            $p->where('agency_name', 'like', "%{$s}%")
                              ->orWhere('agency_owner_name', 'like', "%{$s}%");
                        });
                });
            })
            ->latest()
            ->paginate($perPage);
    }
}