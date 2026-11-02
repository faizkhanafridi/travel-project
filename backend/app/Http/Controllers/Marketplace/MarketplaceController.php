<?php
// app/Http/Controllers/Marketplace/MarketplaceController.php

namespace App\Http\Controllers\Marketplace;

use App\Http\Controllers\Controller;
use App\Http\Requests\Marketplace\SearchServicesRequest;
use App\Http\Resources\Marketplace\MarketplaceCardResource;
use App\Http\Resources\Marketplace\MarketplaceFilterOptionsResource;
use App\Services\Marketplace\MarketplaceService;
use Illuminate\Http\JsonResponse;

class MarketplaceController extends Controller
{
    public function __construct(private MarketplaceService $service) {}

    public function index(SearchServicesRequest $request): JsonResponse
    {
        $paginator = $this->service->search($request->validated());

        return MarketplaceCardResource::collection($paginator)->response();
    }

    public function filters(): JsonResponse
    {
        $options = $this->service->filterOptions();

        return (new MarketplaceFilterOptionsResource($options))->response();
    }
}