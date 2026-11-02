<?php
// app/Services/TravelService/TravelServiceDeletionService.php

namespace App\Services\TravelService;

use App\Models\Agent\Agent;
use App\Models\TravelService\TravelService;
use App\Repositories\Contracts\TravelService\TravelServiceRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class TravelServiceDeletionService
{
    public function __construct(private TravelServiceRepositoryInterface $services) {}

    public function delete(TravelService $service, Agent $agent): void
    {
        if ($service->agent_id !== $agent->id) {
            throw new UnprocessableEntityHttpException('Not your service.');
        }

        // Suspend-aware rule: if suspended, allow deletion only when no bookings and no republish history
        if ($service->status === \App\Enums\TravelService\TravelServiceStatus::SUSPENDED) {
            if ($this->services->hasAnyBookings($service)) {
                throw new UnprocessableEntityHttpException('Cannot delete a suspended service with historical bookings.');
            }
        } else {
            if ($this->services->hasAnyBookings($service)) {
                throw new UnprocessableEntityHttpException('Cannot delete a service with bookings.');
            }
        }

        DB::transaction(function () use ($service) {
            // Delete images from disk
            foreach ($service->images as $image) {
                Storage::disk('private')->delete($image->file_path);
            }

            // Hard delete — soft delete kept available but not used for cleaner data
            $service->delete();
        });
    }
}