<?php

namespace App\Services\Agent;

use App\Enums\Agent\AgentStatus;
use App\Enums\Agent\ApplicationEventType;
use App\Enums\Auth\RoleName;
use App\Models\Agent\Agent;
use App\Models\User;
use App\Repositories\Contracts\Agent\AgentRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AgentReviewService
{
    public function __construct(
        private AgentRepositoryInterface $agentRepo,
    ) {}

    public function markUnderReview(Agent $agent, User $admin): Agent
    {
        if (! in_array($agent->status, [AgentStatus::PENDING_REVIEW], true)) {
            throw ValidationException::withMessages(['agent' => ['Only pending applications can be marked under review.']]);
        }

        return DB::transaction(function () use ($agent, $admin) {
            $this->agentRepo->update($agent, ['status' => AgentStatus::UNDER_REVIEW]);
            $this->agentRepo->logEvent($agent, [
                'event' => ApplicationEventType::UNDER_REVIEW->value,
                'actor_id' => $admin->id,
            ]);

            return $agent->refresh();
        });
    }

    public function approve(Agent $agent, User $admin): Agent
    {
        if (! in_array($agent->status, [AgentStatus::PENDING_REVIEW, AgentStatus::UNDER_REVIEW], true)) {
            throw ValidationException::withMessages(['agent' => ['This application cannot be approved in its current status.']]);
        }

        return DB::transaction(function () use ($agent, $admin) {
            $this->agentRepo->update($agent, [
                'status' => AgentStatus::APPROVED,
                'approved_at' => now(),
            ]);

            // Assign the agent role to the user. This is the ONLY place that grants agent role.
            $agent->user->assignRole(RoleName::AGENT->value);

            // Freeze documents as approved (view-only).
            $this->agentRepo->markApprovedDocuments($agent);

            // Update the latest attempt.
            $latest = $agent->attempts()->latest('attempt_number')->first();
            if ($latest) {
                $latest->update([
                    'status' => AgentStatus::APPROVED->value,
                    'reviewed_at' => now(),
                    'reviewed_by' => $admin->id,
                ]);
            }

            $this->agentRepo->logEvent($agent, [
                'event' => ApplicationEventType::APPROVED->value,
                'actor_id' => $admin->id,
            ]);

            return $agent->refresh();
        });
    }

    public function reject(Agent $agent, User $admin, string $reason): Agent
    {
        if (! in_array($agent->status, [AgentStatus::PENDING_REVIEW, AgentStatus::UNDER_REVIEW], true)) {
            throw ValidationException::withMessages(['agent' => ['This application cannot be rejected in its current status.']]);
        }

        if (trim($reason) === '') {
            throw ValidationException::withMessages(['rejection_reason' => ['A rejection reason is required.']]);
        }

        return DB::transaction(function () use ($agent, $admin, $reason) {
            $this->agentRepo->update($agent, [
                'status' => AgentStatus::REJECTED,
                'rejected_at' => now(),
            ]);

            $latest = $agent->attempts()->latest('attempt_number')->first();
            if ($latest) {
                $latest->update([
                    'status' => AgentStatus::REJECTED->value,
                    'reviewed_at' => now(),
                    'reviewed_by' => $admin->id,
                    'rejection_reason' => $reason,
                ]);
            }

            $this->agentRepo->logEvent($agent, [
                'event' => ApplicationEventType::REJECTED->value,
                'actor_id' => $admin->id,
                'note' => $reason,
            ]);

            return $agent->refresh();
        });
    }

    public function suspend(Agent $agent, User $admin, string $reason): Agent
    {
        if ($agent->status !== AgentStatus::APPROVED) {
            throw ValidationException::withMessages(['agent' => ['Only approved agents can be suspended.']]);
        }

        return DB::transaction(function () use ($agent, $admin, $reason) {
            $this->agentRepo->update($agent, ['status' => AgentStatus::SUSPENDED]);
            $agent->user->removeRole(RoleName::AGENT->value);
            $this->agentRepo->logEvent($agent, [
                'event' => ApplicationEventType::SUSPENDED->value,
                'actor_id' => $admin->id,
                'note' => $reason,
            ]);

            return $agent->refresh();
        });
    }

    public function unsuspend(Agent $agent, User $admin): Agent
    {
        if ($agent->status !== AgentStatus::SUSPENDED) {
            throw ValidationException::withMessages([
                'agent' => ['Only suspended agents can be unsuspended.'],
            ]);
        }

        return DB::transaction(function () use ($agent, $admin) {
            $this->agentRepo->update($agent, ['status' => AgentStatus::APPROVED]);

            // Re-grant the agent role — this is the ONLY other place (besides approve)
            // that grants the role, and only after review has confirmed identity.
            $agent->user->assignRole(RoleName::AGENT->value);

            $this->agentRepo->logEvent($agent, [
                'event' => ApplicationEventType::UNSUSPENDED->value,
                'actor_id' => $admin->id,
            ]);

            return $agent->refresh();
        });
    }
}