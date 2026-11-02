<?php
// app/Repositories/Contracts/TravelService/TravelServiceRepositoryInterface.php

namespace App\Repositories\Contracts\TravelService;

use App\Models\Agent\Agent;
use App\Models\TravelService\TravelService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface TravelServiceRepositoryInterface
{
    public function findByUuid(string $uuid): ?TravelService;
    public function findByUuidForAgent(string $uuid, Agent $agent): ?TravelService;
    public function create(array $data): TravelService;
    public function update(TravelService $service, array $data): TravelService;
    public function paginateForAgent(Agent $agent, array $filters): LengthAwarePaginator;
    public function paginateForAdmin(array $filters): LengthAwarePaginator;
    public function paginatePublic(array $filters): LengthAwarePaginator;
    public function hasActiveBookings(TravelService $service): bool;
    public function hasAnyBookings(TravelService $service): bool;
}