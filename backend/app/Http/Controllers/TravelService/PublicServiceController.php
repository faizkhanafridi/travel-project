<?php
// app/Http/Controllers/TravelService/PublicServiceController.php

namespace App\Http\Controllers\TravelService;

use App\Http\Controllers\Controller;
use App\Http\Resources\TravelService\TravelServiceCardResource;
use App\Http\Resources\TravelService\TravelServiceDetailResource;
use App\Models\TravelService\ServiceCategory;
use App\Repositories\Contracts\TravelService\TravelServiceRepositoryInterface;
use App\Services\TravelService\TravelServiceImageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PublicServiceController extends Controller
{
    public function __construct(
        private TravelServiceRepositoryInterface $services,
        private TravelServiceImageService $images,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $filters = $request->only([
            'q', 'category_id', 'subcategory_id', 'destination_country', 'destination_city',
            'price_min', 'price_max', 'duration_min', 'duration_max', 'sort', 'per_page',
        ]);

        $paginator = $this->services->paginatePublic($filters);

        return TravelServiceCardResource::collection($paginator)->response();
    }

    public function show(Request $request, string $uuid): JsonResponse
    {
        $service = $this->services->findByUuid($uuid);
        abort_unless($service && $service->status?->isPublic(), 404, 'Service not found.');

        return (new TravelServiceDetailResource($service->load([
            'category', 'subcategory', 'tags', 'inclusions', 'extras',
            'images', 'requirements', 'agent.profile',
        ])))->response();
    }

    public function image(string $uuid): StreamedResponse
    {
        return $this->images->stream($uuid);
    }

    public function navigation(): JsonResponse
    {
        $subs = ServiceCategory::whereNotNull('parent_id')
            ->orderBy('sort_order')
            ->get(['id', 'uuid', 'name', 'slug', 'parent_id'])
            ->map(fn ($s) => [
                'id' => $s->id,
                'uuid' => $s->uuid,
                'name' => $s->name,
                'slug' => $s->slug,
            ]);

        return response()->json(['data' => $subs]);
    }
}