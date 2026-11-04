<?php
// app/Repositories/Eloquent/TravelPost/OfferRepository.php

namespace App\Repositories\Eloquent\TravelPost;

use App\Models\Agent\Agent;
use App\Models\TravelPost\TravelOffer;
use App\Models\TravelPost\TravelPost;
use App\Repositories\Contracts\TravelPost\OfferRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

class OfferRepository implements OfferRepositoryInterface
{
    public function findByUuid(string $uuid): ?TravelOffer
    {
        return TravelOffer::with(['agent.user', 'agent.profile', 'requirements', 'post'])
            ->where('uuid', $uuid)->first();
    }

    public function findForPostAndAgent(TravelPost $post, Agent $agent): ?TravelOffer
    {
        return TravelOffer::where('travel_post_id', $post->id)
            ->where('agent_id', $agent->id)->first();
    }

    public function create(array $data): TravelOffer
    {
        $data['uuid'] = $data['uuid'] ?? (string) Str::uuid();
        return TravelOffer::create($data);
    }

    public function update(TravelOffer $offer, array $data): TravelOffer
    {
        $offer->fill($data)->save();
        return $offer->fresh();
    }

    public function paginateForPost(TravelPost $post, array $filters): LengthAwarePaginator
    {
        $query = TravelOffer::with(['agent.user', 'agent.profile', 'requirements'])
            ->where('travel_post_id', $post->id);

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // Highest bid first per Upwork spec
        return $query->orderByDesc('amount')->paginate((int) ($filters['per_page'] ?? 15));
    }

    public function paginateForAgent(Agent $agent, array $filters): LengthAwarePaginator
    {
        $query = TravelOffer::with(['post.customer', 'post.category', 'post.subcategory'])
            ->where('agent_id', $agent->id);

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->orderByDesc('created_at')->paginate((int) ($filters['per_page'] ?? 15));
    }
}