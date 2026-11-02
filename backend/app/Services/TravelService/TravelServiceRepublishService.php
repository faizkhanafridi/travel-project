<?php
// app/Services/TravelService/TravelServiceRepublishService.php

namespace App\Services\TravelService;

use App\Enums\TravelService\RepublishRequestStatus;
use App\Enums\TravelService\TravelServiceStatus;
use App\Models\Agent\Agent;
use App\Models\TravelService\TravelService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class TravelServiceRepublishService
{
    public function request(TravelService $service, Agent $agent, string $reason): \App\Models\TravelService\ServiceRepublishRequest
    {
        if ($service->agent_id !== $agent->id) {
            throw new UnprocessableEntityHttpException('Not your service.');
        }
        if ($service->status !== TravelServiceStatus::UNPUBLISHED) {
            throw new UnprocessableEntityHttpException('Only unpublished services can be requested for republish.');
        }
        $pending = $service->republishRequests()
            ->where('status', RepublishRequestStatus::PENDING->value)
            ->exists();
        if ($pending) {
            throw new UnprocessableEntityHttpException('A republish request is already pending.');
        }

        return DB::transaction(function () use ($service, $agent, $reason) {
            $req = $service->republishRequests()->create([
                'uuid' => (string) Str::uuid(),
                'agent_id' => $agent->id,
                'status' => RepublishRequestStatus::PENDING->value,
                'reason' => $reason,
            ]);

            $service->history()->create([
                'uuid' => (string) Str::uuid(),
                'action' => 'republish_requested',
                'reason' => $reason,
            ]);

            return $req;
        });
    }
}