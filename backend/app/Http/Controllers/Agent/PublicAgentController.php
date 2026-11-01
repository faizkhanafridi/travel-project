<?php
// app/Http/Controllers/Agent/PublicAgentController.php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Repositories\Contracts\Agent\AgentRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicAgentController extends Controller
{
    public function __construct(private AgentRepositoryInterface $agents) {}

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->agents->paginateApproved($request->only(['search', 'per_page']));

        $data = $paginator->through(fn ($agent) => [
            'uuid' => $agent->uuid,
            'agency_name' => $agent->profile?->agency_name,
            'country' => $agent->profile?->agency_country,
            'city' => $agent->profile?->agency_city,
            'approved_at' => $agent->approved_at?->toIso8601String(),
        ]);

        return response()->json($data);
    }

    public function show(string $uuid): JsonResponse
    {
        $agent = $this->agents->findByUuid($uuid);
        abort_unless($agent && $agent->isApproved(), 404, 'Agent not found.');

        $agent->load(['profile', 'businessHours']);

        return response()->json([
            'data' => [
                'uuid' => $agent->uuid,
                'agency_name' => $agent->profile?->agency_name,
                'agency_owner_name' => $agent->profile?->agency_owner_name,
                'agency_country' => $agent->profile?->agency_country,
                'agency_city' => $agent->profile?->agency_city,
                'agency_address' => $agent->profile?->agency_address,
                'business_description' => $agent->profile?->business_description,
                'years_in_business' => $agent->profile?->years_in_business,
                'business_type' => $agent->profile?->business_type,
                'website' => $agent->profile?->website,
                'social_media' => $agent->profile?->social_media ?? [],
                'languages' => $agent->profile?->languages ?? [],
                'specializations' => $agent->profile?->specializations ?? [],
                'business_hours' => $agent->businessHours->map(fn ($h) => [
                    'day_of_week' => $h->day_of_week,
                    'is_closed' => $h->is_closed,
                    'open_time' => $h->open_time,
                    'close_time' => $h->close_time,
                ])->all(),
                'approved_at' => $agent->approved_at?->toIso8601String(),
            ],
        ]);
    }
}