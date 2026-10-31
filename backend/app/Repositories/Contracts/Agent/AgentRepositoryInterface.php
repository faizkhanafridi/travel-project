<?php

namespace App\Repositories\Contracts\Agent;

use App\Models\Agent\Agent;
use App\Models\User;

interface AgentRepositoryInterface
{
    public function findByUser(User $user): ?Agent;

    public function findByUuid(string $uuid): ?Agent;

    public function createForUser(User $user): Agent;

    public function update(Agent $agent, array $data): Agent;

    public function saveAgencyInfo(Agent $agent, array $data): void;

    public function saveBusinessInfo(Agent $agent, array $data): void;

    public function replaceBusinessHours(Agent $agent, array $hours): void;

    public function addDocument(Agent $agent, array $data): void;

    public function createAttempt(Agent $agent, array $data): void;

    public function updateLatestAttempt(Agent $agent, array $data): void;

    public function markApprovedDocuments(Agent $agent): void;

    public function logEvent(Agent $agent, array $data): void;

    public function paginateForAdmin(array $filters, int $perPage = 20);
}