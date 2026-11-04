<?php
// app/Http/Controllers/TravelPost/OfferController.php

namespace App\Http\Controllers\TravelPost;

use App\Http\Controllers\Controller;
use App\Http\Requests\TravelPost\OfferDecisionRequest;
use App\Http\Requests\TravelPost\SubmitOfferRequest;
use App\Http\Resources\TravelPost\OfferResource;
use App\Models\Agent\Agent;
use App\Repositories\Contracts\TravelPost\OfferRepositoryInterface;
use App\Services\TravelPost\OfferService;
use App\Services\TravelPost\TravelPostService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OfferController extends Controller
{
    public function __construct(
        private OfferService $offers,
        private TravelPostService $posts,
        private OfferRepositoryInterface $offerRepo,
    ) {}

    public function submit(SubmitOfferRequest $request, string $postUuid): JsonResponse
    {
        $post = $this->posts->findOpen($postUuid);
        $offer = $this->offers->submit($request->user(), $post, $request->validated());

        return (new OfferResource($offer))->response()->setStatusCode(201);
    }

    public function myOffers(Request $request): JsonResponse
    {
        $agent = Agent::where('user_id', $request->user()->id)->first();
        abort_unless($agent, 403, 'Only agents have offers.');

        $paginator = $this->offers->listForAgent($agent, $request->only(['status', 'per_page']));

        return OfferResource::collection($paginator)->response();
    }

    public function decide(OfferDecisionRequest $request, string $offerUuid): JsonResponse
    {
        $offer = $this->offerRepo->findByUuid($offerUuid);
        abort_unless($offer, 404, 'Offer not found.');

        $offer = $this->offers->decide($request->user(), $offer, (string) $request->string('decision'));

        return (new OfferResource($offer->load(['requirements', 'agent.user', 'agent.profile'])))->response();
    }

    public function withdraw(Request $request, string $offerUuid): JsonResponse
    {
        $offer = $this->offerRepo->findByUuid($offerUuid);
        abort_unless($offer, 404, 'Offer not found.');

        $offer = $this->offers->withdraw($request->user(), $offer);

        return (new OfferResource($offer))->response();
    }
}