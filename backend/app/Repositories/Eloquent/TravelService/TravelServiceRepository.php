<?php
// app/Repositories/Eloquent/TravelService/TravelServiceRepository.php

namespace App\Repositories\Eloquent\TravelService;

use App\Enums\TravelService\TravelServiceStatus;
use App\Models\Agent\Agent;
use App\Models\TravelService\TravelService;
use App\Repositories\Contracts\TravelService\TravelServiceRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TravelServiceRepository implements TravelServiceRepositoryInterface
{
    public function findByUuid(string $uuid): ?TravelService
    {
        return TravelService::with([
            'category', 'subcategory', 'tags', 'inclusions', 'extras',
            'images', 'requirements', 'history', 'republishRequests', 'agent.user', 'agent.profile',
        ])->where('uuid', $uuid)->first();
    }

    public function findByUuidForAgent(string $uuid, Agent $agent): ?TravelService
    {
        return TravelService::with([
            'category', 'subcategory', 'tags', 'inclusions', 'extras',
            'images', 'requirements', 'history', 'republishRequests',
        ])
        ->where('uuid', $uuid)
        ->where('agent_id', $agent->id)
        ->where('status', '!=', TravelServiceStatus::SUSPENDED->value)
        ->first();
    }

    public function create(array $data): TravelService
    {
        $data['uuid'] = $data['uuid'] ?? (string) Str::uuid();
        return TravelService::create($data);
    }

    public function update(TravelService $service, array $data): TravelService
    {
        $service->fill($data)->save();
        return $service->fresh();
    }

    public function paginateForAgent(Agent $agent, array $filters): LengthAwarePaginator
    {
        $query = TravelService::with(['category', 'subcategory', 'images', 'tags'])
            ->where('agent_id', $agent->id)
            ->where('status', '!=', TravelServiceStatus::SUSPENDED->value);

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (! empty($filters['search'])) {
            $query->where('title', 'like', '%' . $filters['search'] . '%');
        }

        return $query->latest()->paginate((int) ($filters['per_page'] ?? 15));
    }

    public function paginateForAdmin(array $filters): LengthAwarePaginator
    {
        $query = TravelService::with(['agent.user', 'agent.profile', 'category', 'subcategory'])
            ->latest('submitted_at');

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhereHas('agent.profile', fn ($p) => $p->where('agency_name', 'like', "%{$search}%"));
            });
        }

        return $query->paginate((int) ($filters['per_page'] ?? 20));
    }

    public function paginatePublic(array $filters): LengthAwarePaginator
    {
        $query = TravelService::with(['agent.profile', 'images', 'tags', 'category', 'subcategory'])
            ->where('status', TravelServiceStatus::PUBLISHED->value);

        if (! empty($filters['subcategory_id'])) {
            $query->where('subcategory_id', $filters['subcategory_id']);
        }
        if (! empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }
        if (! empty($filters['destination_country'])) {
            $query->where('destination_country', $filters['destination_country']);
        }
        if (! empty($filters['destination_city'])) {
            $query->where('destination_city', $filters['destination_city']);
        }
        if (! empty($filters['duration_min'])) {
            $query->where('duration', '>=', (int) $filters['duration_min']);
        }
        if (! empty($filters['duration_max'])) {
            $query->where('duration', '<=', (int) $filters['duration_max']);
        }
        if (! empty($filters['price_min'])) {
            $query->where('price', '>=', (float) $filters['price_min']);
        }
        if (! empty($filters['price_max'])) {
            $query->where('price', '<=', (float) $filters['price_max']);
        }

        $search = $filters['q'] ?? null;
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('short_description', 'like', "%{$search}%")
                  ->orWhere('destination_city', 'like', "%{$search}%")
                  ->orWhere('destination_country', 'like', "%{$search}%")
                  ->orWhereHas('tags', fn ($t) => $t->where('tag', 'like', "%{$search}%"))
                  ->orWhereHas('subcategory', fn ($s) => $s->where('name', 'like', "%{$search}%"))
                  ->orWhereHas('category', fn ($c) => $c->where('name', 'like', "%{$search}%"));
            });
        }

        switch ($filters['sort'] ?? 'recommended') {
            case 'price_asc':  $query->orderBy('price'); break;
            case 'price_desc': $query->orderByDesc('price'); break;
            case 'newest':     $query->orderByDesc('published_at'); break;
            default:           $query->orderByDesc('published_at'); break;
        }

        return $query->paginate((int) ($filters['per_page'] ?? 20));
    }

    public function hasActiveBookings(TravelService $service): bool
    {
        return DB::table('bookings')
            ->where('travel_service_id', $service->id)
            ->whereNotIn('status', ['COMPLETED', 'CANCELLED'])
            ->exists();
    }

    public function hasAnyBookings(TravelService $service): bool
    {
        return DB::table('bookings')->where('travel_service_id', $service->id)->exists();
    }
}