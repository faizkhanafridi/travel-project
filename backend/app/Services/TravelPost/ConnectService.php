<?php
// app/Services/TravelPost/ConnectService.php

namespace App\Services\TravelPost;

use App\Models\Agent\Agent;
use App\Repositories\Contracts\TravelPost\ConnectRepositoryInterface;
use App\Services\Agent\AgentReviewService;
use Illuminate\Support\Collection;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class ConnectService
{
    /** Cost in connects to submit an offer on a global post. */
    public const GLOBAL_POST_OFFER_COST = 6;

    public function __construct(private ConnectRepositoryInterface $connects) {}

    public function packages(): Collection
    {
        return $this->connects->packages();
    }

    public function spend(Agent $agent, int $amount, ?string $refType = null, ?int $refId = null, ?string $note = null): void
    {
        if ($amount <= 0) {
            return;
        }
        if ($agent->connects_balance < $amount) {
            throw new UnprocessableEntityHttpException('Not enough connects. Please purchase more connects.');
        }
        $agent->connects_balance -= $amount;
        $agent->save();

        $this->connects->record($agent, 'offer_spend', -$amount, $note, $refType, $refId);
    }

    public function refund(Agent $agent, int $amount, ?string $refType = null, ?int $refId = null, ?string $note = null): void
    {
        if ($amount <= 0) {
            return;
        }
        $agent->connects_balance += $amount;
        $agent->save();

        $this->connects->record($agent, 'refund', $amount, $note, $refType, $refId);
    }

    public function grantInitialIfNeeded(Agent $agent): void
    {
        // Temporary — Finance module will replace this later.
        if (! $agent->connects_awarded) {
            $agent->connects_balance += AgentReviewService::INITIAL_CONNECTS_AWARD;
            $agent->connects_awarded = true;
            $agent->save();
            $this->connects->record($agent, 'initial_award', AgentReviewService::INITIAL_CONNECTS_AWARD, 'Initial connects award');
        }
    }
}