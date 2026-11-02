<?php
// app/Repositories/Contracts/Marketplace/MarketplaceRepositoryInterface.php

namespace App\Repositories\Contracts\Marketplace;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface MarketplaceRepositoryInterface
{
    public function search(array $filters): LengthAwarePaginator;

    public function filterOptions(): array;
}