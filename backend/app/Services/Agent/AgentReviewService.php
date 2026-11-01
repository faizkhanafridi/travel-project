<?php
// app/Services/Agent/AgentReviewService.php

namespace App\Services\Agent;

use App\Enums\Agent\AgentStatus;
use App\Models\Agent\Agent;
use App\Models\Auth\User;
use App\Repositories\Contracts\Agent\AgentRepositoryInterface;
use App\Repositories\Contracts\Auth\UserRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class AgentReviewService
{
    // Temporary — remove when Finance module is built
    public const INITIAL_CONNECTS_AWARD = 200;

    public function __construct(
        private AgentRepositoryInterface $agents,
        private UserRepositoryInterface $users,
    ) {}

    public function markUnderReview(Agent $agent, User $admin): Agent
    {
        if ($agent->status !== AgentStatus::PENDING_REVIEW) {
            throw new UnprocessableEntityHttpException('Only pending applications can be marked under review.');
        }

        return DB::transaction(function () use ($agent, $admin) {
            $updated = $this->agents->update($agent, [
                'status' => AgentStatus::UNDER_REVIEW->value,
                'reviewed_at' => now(),
                'reviewed_by' => $admin->id,
            ]);

            $updated->submissionHistory()->create([
                'uuid' => (string) Str::uuid(),
                'attempt' => $updated->attempt,
                'action' => 'under_review',
                'admin_id' => $admin->id,
            ]);

            return $updated;
        });
    }

    public function approve(Agent $agent, User $admin): Agent
    {
        if (! in_array($agent->status, [AgentStatus::PENDING_REVIEW, AgentStatus::UNDER_REVIEW], true)) {
            throw new UnprocessableEntityHttpException('Application cannot be approved in its current state.');
        }

        return DB::transaction(function () use ($agent, $admin) {
            $updated = $this->agents->update($agent, [
                'status' => AgentStatus::APPROVED->value,
                'reviewed_at' => now(),
                'reviewed_by' => $admin->id,
                'approved_at' => now(),
                'rejection_reason' => null,
            ]);

            // Assign Agent role
            $owner = $updated->user;
            $this->users->assignRole($owner, \App\Enums\Auth\UserRole::AGENT->value);

            // Lock documents — becomes view-only for the agent
            $updated->documents()->whereNull('locked_at')->update(['locked_at' => now()]);

            // TEMPORARY: award 200 connects once on first approval.
            // This entire block must be removed when Finance module ships.
            if (! $updated->connects_awarded) {
                $this->agents->update($updated, [
                    'connects_balance' => $updated->connects_balance + self::INITIAL_CONNECTS_AWARD,
                    'connects_awarded' => true,
                ]);
            }

            $updated->submissionHistory()->create([
                'uuid' => (string) Str::uuid(),
                'attempt' => $updated->attempt,
                'action' => 'approved',
                'admin_id' => $admin->id,
            ]);

            return $updated->fresh();
        });
    }

    public function reject(Agent $agent, User $admin, string $reason): Agent
    {
        if (! in_array($agent->status, [AgentStatus::PENDING_REVIEW, AgentStatus::UNDER_REVIEW], true)) {
            throw new UnprocessableEntityHttpException('Application cannot be rejected in its current state.');
        }

        if (trim($reason) === '') {
            throw new UnprocessableEntityHttpException('Rejection reason is required.');
        }

        return DB::transaction(function () use ($agent, $admin, $reason) {
            $updated = $this->agents->update($agent, [
                'status' => AgentStatus::REJECTED->value,
                'reviewed_at' => now(),
                'reviewed_by' => $admin->id,
                'rejection_reason' => $reason,
            ]);

            $updated->submissionHistory()->create([
                'uuid' => (string) Str::uuid(),
                'attempt' => $updated->attempt,
                'action' => 'rejected',
                'reason' => $reason,
                'admin_id' => $admin->id,
            ]);

            return $updated;
        });
    }
}