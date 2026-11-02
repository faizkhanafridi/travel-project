<?php
// app/Services/Marketplace/MarketplaceService.php

namespace App\Services\Marketplace;

use App\Repositories\Contracts\Marketplace\MarketplaceRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class MarketplaceService
{
    public function __construct(private MarketplaceRepositoryInterface $marketplace) {}

    public function search(array $filters): LengthAwarePaginator
    {
        return $this->marketplace->search($filters);
    }

    public function filterOptions(): array
    {
        return $this->marketplace->filterOptions();
    }
}