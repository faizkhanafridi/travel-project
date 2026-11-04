<?php
// app/Http/Controllers/TravelPost/ServiceTripRequestController.php

namespace App\Http\Controllers\TravelPost;

use App\Http\Controllers\Controller;
use App\Http\Resources\TravelPost\TravelPostDetailResource;
use App\Models\Agent\Agent;
use App\Repositories\Contracts\TravelPost\TravelPostRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceTripRequestController extends Controller
{
    public function __construct(private TravelPostRepositoryInterface $posts) {}

    public function agentIndex(Request $request): JsonResponse
    {
        $agent = Agent::where('user_id', $request->user()->id)->first();
        abort_unless($agent, 403, 'Only agents can view service trip requests.');

        $query = \App\Models\TravelPost\TravelPost::with(['customer', 'service', 'category', 'subcategory'])
            ->where('type', 'service_request')
            ->where('agent_id', $agent->id)
            ->orderByDesc('created_at')
            ->paginate((int) $request->query('per_page', 15));

        return \App\Http\Resources\TravelPost\TravelPostListResource::collection($query)->response();
    }

    public function show(Request $request, string $uuid): JsonResponse
    {
        $agent = Agent::where('user_id', $request->user()->id)->first();
        abort_unless($agent, 403, 'Only agents can view service trip requests.');

        $post = $this->posts->findByUuid($uuid);
        abort_unless($post && $post->agent_id === $agent->id, 404, 'Request not found.');

        return (new TravelPostDetailResource($post->load([
            'category', 'subcategory', 'customer', 'service',
            'offers.agent.user', 'offers.agent.profile', 'offers.requirements',
        ])))->response();
    }
}