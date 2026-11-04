<?php
// app/Repositories/Eloquent/TravelPost/TravelPostRepository.php

namespace App\Repositories\Eloquent\TravelPost;

use App\Enums\TravelPost\TravelPostStatus;
use App\Enums\TravelPost\TravelPostType;
use App\Models\Auth\User;
use App\Models\TravelPost\TravelPost;
use App\Repositories\Contracts\TravelPost\TravelPostRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

class TravelPostRepository implements TravelPostRepositoryInterface
{
    public function findByUuid(string $uuid): ?TravelPost
    {
        return TravelPost::with([
            'customer.profile', 'agent.user', 'agent.profile', 'service',
            'category', 'subcategory', 'offers.agent.user', 'offers.agent.profile',
            'offers.requirements',
        ])->where('uuid', $uuid)->first();
    }

    public function create(array $data): TravelPost
    {
        $data['uuid'] = $data['uuid'] ?? (string) Str::uuid();
        return TravelPost::create($data);
    }

    public function update(TravelPost $post, array $data): TravelPost
    {
        $post->fill($data)->save();
        return $post->fresh();
    }

    public function paginateGlobal(array $filters): LengthAwarePaginator
    {
        $query = TravelPost::with(['customer', 'category', 'subcategory'])
            ->where('type', TravelPostType::GLOBAL->value);

        if (empty($filters['status'])) {
            $query->where('status', TravelPostStatus::OPEN->value);
        } else {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['category_id'])) {
            $query->where('category_id', (int) $filters['category_id']);
        }
        if (! empty($filters['subcategory_id'])) {
            $query->where('subcategory_id', (int) $filters['subcategory_id']);
        }
        if (! empty($filters['destination_country'])) {
            $query->where('destination_country', $filters['destination_country']);
        }
        if (! empty($filters['destination_city'])) {
            $query->where('destination_city', $filters['destination_city']);
        }
        if (! empty($filters['budget_min'])) {
            $query->where('budget_max', '>=', (float) $filters['budget_min']);
        }
        if (! empty($filters['budget_max'])) {
            $query->where('budget_min', '<=', (float) $filters['budget_max']);
        }

        $q = trim((string) ($filters['q'] ?? ''));
        if ($q !== '') {
            $query->where(function ($qry) use ($q) {
                $qry->where('title', 'like', "%{$q}%")
                    ->orWhere('description', 'like', "%{$q}%")
                    ->orWhere('destination_city', 'like', "%{$q}%")
                    ->orWhere('destination_country', 'like', "%{$q}%");
            });
        }

        return $query->orderByDesc('created_at')->paginate((int) ($filters['per_page'] ?? 15));
    }

    public function paginateForCustomer(User $customer, array $filters): LengthAwarePaginator
    {
        $query = TravelPost::with(['agent.user', 'agent.profile', 'service', 'offers'])
            ->where('customer_id', $customer->id);

        if (! empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }
        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->orderByDesc('created_at')->paginate((int) ($filters['per_page'] ?? 15));
    }
}