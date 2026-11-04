<?php
// app/Repositories/Eloquent/TravelPost/ConnectRepository.php

namespace App\Repositories\Eloquent\TravelPost;

use App\Models\Agent\Agent;
use App\Models\TravelPost\ConnectPackage;
use App\Models\TravelPost\ConnectTransaction;
use App\Repositories\Contracts\TravelPost\ConnectRepositoryInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class ConnectRepository implements ConnectRepositoryInterface
{
    public function packages(): Collection
    {
        return ConnectPackage::where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('connects')
            ->get();
    }

    public function activePackageByUuid(string $uuid): ?ConnectPackage
    {
        return ConnectPackage::where('uuid', $uuid)->where('is_active', true)->first();
    }

    public function record(Agent $agent, string $type, int $amount, ?string $note = null, ?string $refType = null, ?int $refId = null): ConnectTransaction
    {
        return ConnectTransaction::create([
            'uuid' => (string) Str::uuid(),
            'agent_id' => $agent->id,
            'type' => $type,
            'amount' => $amount,
            'balance_after' => $agent->connects_balance,
            'reference_type' => $refType,
            'reference_id' => $refId,
            'note' => $note,
        ]);
    }
}