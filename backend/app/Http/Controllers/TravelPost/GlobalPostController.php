<?php
// app/Http/Controllers/TravelPost/GlobalPostController.php

namespace App\Http\Controllers\TravelPost;

use App\Http\Controllers\Controller;
use App\Http\Requests\TravelPost\CreateGlobalPostRequest;
use App\Http\Requests\TravelPost\CreateServiceTripRequest;
use App\Http\Resources\TravelPost\TravelPostDetailResource;
use App\Http\Resources\TravelPost\TravelPostListResource;
use App\Models\Agent\Agent;
use App\Models\TravelService\TravelService;
use App\Services\TravelPost\OfferService;
use App\Services\TravelPost\TravelPostService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GlobalPostController extends Controller
{
    public function __construct(
        private TravelPostService $posts,
        private OfferService $offers,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->posts->listGlobal($request->only([
            'q',
            'category_id',
            'subcategory_id',
            'destination_country',
            'destination_city',
            'budget_min',
            'budget_max',
            'status',
            'per_page',
        ]));

        return TravelPostListResource::collection($paginator)->response();
    }

    public function store(CreateGlobalPostRequest $request): JsonResponse
    {
        $user = $request->user();
        if ($user->hasRole('agent') || $user->hasRole('super_admin')) {
            abort(403, 'Only customers can create travel posts.');
        }
        $post = $this->posts->createGlobal($request->user(), $request->validated());

        return (new TravelPostDetailResource($post->load(['category', 'subcategory', 'customer'])))
            ->response()
            ->setStatusCode(201);
    }

    public function show(string $uuid): JsonResponse
    {
        $post = $this->posts->findOpen($uuid);

        return (new TravelPostDetailResource($post->load([
            'category',
            'subcategory',
            'customer.profile',
            'offers.agent.user',
            'offers.agent.profile',
            'offers.requirements',
        ])))->response();
    }

    public function myIndex(Request $request): JsonResponse
    {
        $paginator = $this->posts->listForCustomer($request->user(), $request->only(['type', 'status', 'per_page']));

        return TravelPostListResource::collection($paginator)->response();
    }

    public function cancel(Request $request, string $uuid): JsonResponse
    {
        $post = $this->posts->cancel($request->user(), $uuid);

        return (new TravelPostDetailResource($post->load(['category', 'subcategory', 'customer'])))->response();
    }

    public function storeServiceRequest(CreateServiceTripRequest $request, string $serviceUuid): JsonResponse
    {

        $user = $request->user();
        if ($user->hasRole('agent') || $user->hasRole('super_admin')) {
            abort(403, 'Only customers can create travel posts.');
        }

        $service = TravelService::with('category')->where('uuid', $serviceUuid)->first();
        abort_unless($service, 404, 'Service not found.');

        $post = $this->posts->createServiceRequest($request->user(), $service, $request->validated());

        return (new TravelPostDetailResource($post->load(['category', 'subcategory', 'customer', 'agent.profile'])))
            ->response()
            ->setStatusCode(201);
    }

    public function offers(Request $request, string $postUuid): JsonResponse
    {
        $post = $this->posts->findForCustomer($request->user(), $postUuid);
        $paginator = $this->offers->listForPost($post, $request->only(['status', 'per_page']));

        return \App\Http\Resources\TravelPost\OfferResource::collection($paginator)->response();
    }
}
