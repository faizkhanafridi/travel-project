<?php
// app/Repositories/Contracts/TravelPost/OfferRepositoryInterface.php

namespace App\Repositories\Contracts\TravelPost;

use App\Models\Agent\Agent;
use App\Models\TravelPost\TravelOffer;
use App\Models\TravelPost\TravelPost;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface OfferRepositoryInterface
{
    public function findByUuid(string $uuid): ?TravelOffer;
    public function findForPostAndAgent(TravelPost $post, Agent $agent): ?TravelOffer;
    public function create(array $data): TravelOffer;
    public function update(TravelOffer $offer, array $data): TravelOffer;
    public function paginateForPost(TravelPost $post, array $filters): LengthAwarePaginator;
    public function paginateForAgent(Agent $agent, array $filters): LengthAwarePaginator;
}