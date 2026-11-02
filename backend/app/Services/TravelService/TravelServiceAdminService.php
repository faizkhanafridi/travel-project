<?php
// app/Services/TravelService/TravelServiceAdminService.php

namespace App\Services\TravelService;

use App\Enums\TravelService\RepublishRequestStatus;
use App\Enums\TravelService\TravelServiceStatus;
use App\Models\Auth\User;
use App\Models\TravelService\ServiceRepublishRequest;
use App\Models\TravelService\TravelService;
use App\Repositories\Contracts\TravelService\TravelServiceRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class TravelServiceAdminService
{
    public function __construct(private TravelServiceRepositoryInterface $services) {}

    public function markUnderReview(TravelService $service, User $admin): TravelService
    {
        if ($service->status !== TravelServiceStatus::PENDING_REVIEW) {
            throw new UnprocessableEntityHttpException('Only pending services can be marked under review.');
        }
        return DB::transaction(function () use ($service, $admin) {
            $updated = $this->services->update($service, [
                'status' => TravelServiceStatus::UNDER_REVIEW->value,
                'reviewed_at' => now(),
                'reviewed_by' => $admin->id,
            ]);
            $updated->history()->create([
                'uuid' => (string) Str::uuid(),
                'attempt' => $updated->attempt,
                'action' => 'under_review',
                'admin_id' => $admin->id,
            ]);
            return $updated;
        });
    }

    public function approve(TravelService $service, User $admin): TravelService
    {
        if (! in_array($service->status, [TravelServiceStatus::PENDING_REVIEW, TravelServiceStatus::UNDER_REVIEW], true)) {
            throw new UnprocessableEntityHttpException('Service cannot be approved in its current state.');
        }
        return DB::transaction(function () use ($service, $admin) {
            $updated = $this->services->update($service, [
                'status' => TravelServiceStatus::PUBLISHED->value,
                'published_at' => now(),
                'reviewed_at' => now(),
                'reviewed_by' => $admin->id,
                'rejection_reason' => null,
            ]);
            $updated->history()->create([
                'uuid' => (string) Str::uuid(),
                'attempt' => $updated->attempt,
                'action' => 'approved',
                'admin_id' => $admin->id,
            ]);
            return $updated;
        });
    }

    public function reject(TravelService $service, User $admin, string $reason): TravelService
    {
        if (! in_array($service->status, [TravelServiceStatus::PENDING_REVIEW, TravelServiceStatus::UNDER_REVIEW], true)) {
            throw new UnprocessableEntityHttpException('Service cannot be rejected in its current state.');
        }
        return DB::transaction(function () use ($service, $admin, $reason) {
            $updated = $this->services->update($service, [
                'status' => TravelServiceStatus::REJECTED->value,
                'rejection_reason' => $reason,
                'reviewed_at' => now(),
                'reviewed_by' => $admin->id,
            ]);
            $updated->history()->create([
                'uuid' => (string) Str::uuid(),
                'attempt' => $updated->attempt,
                'action' => 'rejected',
                'reason' => $reason,
                'admin_id' => $admin->id,
            ]);
            return $updated;
        });
    }

    public function unpublish(TravelService $service, User $admin): TravelService
    {
        if ($service->status !== TravelServiceStatus::PUBLISHED) {
            throw new UnprocessableEntityHttpException('Only published services can be unpublished.');
        }
        return DB::transaction(function () use ($service, $admin) {
            $updated = $this->services->update($service, [
                'status' => TravelServiceStatus::UNPUBLISHED->value,
            ]);
            $updated->history()->create([
                'uuid' => (string) Str::uuid(),
                'action' => 'unpublished',
                'admin_id' => $admin->id,
            ]);
                       return $updated;
        });
    }

    public function suspend(TravelService $service, User $admin): TravelService
    {
        // Admin cannot suspend if any active (non-completed, non-cancelled) booking exists
        if ($this->services->hasActiveBookings($service)) {
            throw new UnprocessableEntityHttpException('Cannot suspend a service with active bookings.');
        }

        if ($service->status === TravelServiceStatus::SUSPENDED) {
            throw new UnprocessableEntityHttpException('Service is already suspended.');
        }

        return DB::transaction(function () use ($service, $admin) {
            $updated = $this->services->update($service, [
                'status' => TravelServiceStatus::SUSPENDED->value,
                'suspended_at' => now(),
            ]);
            $updated->history()->create([
                'uuid' => (string) Str::uuid(),
                'action' => 'suspended',
                'admin_id' => $admin->id,
            ]);
            return $updated;
        });
    }

    public function unsuspend(TravelService $service, User $admin): TravelService
    {
        if ($service->status !== TravelServiceStatus::SUSPENDED) {
            throw new UnprocessableEntityHttpException('Service is not suspended.');
        }

        return DB::transaction(function () use ($service, $admin) {
            // Unsuspend restores the service to UNPUBLISHED — admin must republish intentionally
            $updated = $this->services->update($service, [
                'status' => TravelServiceStatus::UNPUBLISHED->value,
                'suspended_at' => null,
            ]);
            $updated->history()->create([
                'uuid' => (string) Str::uuid(),
                'action' => 'unsuspended',
                'admin_id' => $admin->id,
            ]);
            return $updated;
        });
    }

    public function approveRepublish(ServiceRepublishRequest $request, User $admin): TravelService
    {
        if ($request->status !== RepublishRequestStatus::PENDING) {
            throw new UnprocessableEntityHttpException('Request is not pending.');
        }
        $service = $request->service;
        if (! $service || $service->status !== TravelServiceStatus::UNPUBLISHED) {
            throw new UnprocessableEntityHttpException('Service is not in unpublished state.');
        }

        return DB::transaction(function () use ($request, $service, $admin) {
            $request->update([
                'status' => RepublishRequestStatus::APPROVED->value,
                'reviewed_at' => now(),
                'reviewed_by' => $admin->id,
            ]);

            // NO attempt increment. NO new submission record. Just republish the existing service.
            $updated = $this->services->update($service, [
                'status' => TravelServiceStatus::PUBLISHED->value,
                'published_at' => now(),
            ]);

            $updated->history()->create([
                'uuid' => (string) Str::uuid(),
                'action' => 'republish_approved',
                'admin_id' => $admin->id,
            ]);

            return $updated;
        });
    }

    public function rejectRepublish(ServiceRepublishRequest $request, User $admin, string $reason): ServiceRepublishRequest
    {
        if ($request->status !== RepublishRequestStatus::PENDING) {
            throw new UnprocessableEntityHttpException('Request is not pending.');
        }

        return DB::transaction(function () use ($request, $admin, $reason) {
            $request->update([
                'status' => RepublishRequestStatus::REJECTED->value,
                'rejection_reason' => $reason,
                'reviewed_at' => now(),
                'reviewed_by' => $admin->id,
            ]);

            $request->service->history()->create([
                'uuid' => (string) Str::uuid(),
                'action' => 'republish_rejected',
                'reason' => $reason,
                'admin_id' => $admin->id,
            ]);

            return $request->fresh();
        });
    }
}