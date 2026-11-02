<?php
// app/Http/Controllers/TravelService/ServiceCategoryController.php

namespace App\Http\Controllers\TravelService;

use App\Http\Controllers\Controller;
use App\Http\Resources\TravelService\CategoryResource;
use App\Models\TravelService\ServiceCategory;
use Illuminate\Http\JsonResponse;

class ServiceCategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = ServiceCategory::whereNull('parent_id')
            ->with(['children' => fn ($q) => $q->orderBy('sort_order')])
            ->orderBy('sort_order')
            ->get();

        return CategoryResource::collection($categories)->response();
    }
}