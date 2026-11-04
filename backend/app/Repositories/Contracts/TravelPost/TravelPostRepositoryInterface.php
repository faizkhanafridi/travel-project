<?php
// app/Repositories/Contracts/TravelPost/TravelPostRepositoryInterface.php

namespace App\Repositories\Contracts\TravelPost;

use App\Models\Auth\User;
use App\Models\TravelPost\TravelPost;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface TravelPostRepositoryInterface
{
    public function findByUuid(string $uuid): ?TravelPost;
    public function create(array $data): TravelPost;
    public function update(TravelPost $post, array $data): TravelPost;
    public function paginateGlobal(array $filters): LengthAwarePaginator;
    public function paginateForCustomer(User $customer, array $filters): LengthAwarePaginator;
}