<?php
// app/Repositories/Contracts/Agent/AgentRepositoryInterface.php

namespace App\Repositories\Contracts\Agent;

use App\Models\Agent\Agent;
use App\Models\Auth\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface AgentRepositoryInterface
{
    public function findByUser(User $user): ?Agent;

    public function findByUuid(string $uuid): ?Agent;

    public function createForUser(User $user): Agent;

    public function update(Agent $agent, array $data): Agent;

    public function paginateForAdmin(array $filters): LengthAwarePaginator;

    public function paginateApproved(array $filters): LengthAwarePaginator;
}