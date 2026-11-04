<?php
// app/Repositories/Contracts/TravelPost/ConnectRepositoryInterface.php

namespace App\Repositories\Contracts\TravelPost;

use App\Models\Agent\Agent;
use App\Models\TravelPost\ConnectPackage;
use App\Models\TravelPost\ConnectTransaction;

interface ConnectRepositoryInterface
{
    public function packages(): \Illuminate\Support\Collection;
    public function activePackageByUuid(string $uuid): ?ConnectPackage;
    public function record(Agent $agent, string $type, int $amount, string $note = null, ?string $refType = null, ?int $refId = null): ConnectTransaction;
}