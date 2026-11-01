<?php
// app/Http/Controllers/Agent/Admin/AdminAgentController.php

namespace App\Http\Controllers\Agent\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Agent\Admin\RejectAgentRequest;
use App\Http\Resources\Agent\Admin\AgentAdminDetailResource;
use App\Http\Resources\Agent\Admin\AgentAdminListResource;
use App\Models\Agent\Agent;
use App\Repositories\Contracts\Agent\AgentRepositoryInterface;
use App\Services\Agent\AgentReviewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminAgentController extends Controller
{
    public function __construct(
        private AgentRepositoryInterface $agents,
        private AgentReviewService $review,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->agents->paginateForAdmin($request->only(['status', 'search', 'per_page']));

        return AgentAdminListResource::collection($paginator)->response();
    }

    public function show(string $uuid): JsonResponse
    {
        $agent = $this->agents->findByUuid($uuid);
        abort_unless($agent, 404, 'Agent not found.');

        $agent->load(['user', 'profile', 'documents', 'businessHours', 'submissionHistory']);

        return (new AgentAdminDetailResource($agent))->response();
    }

    public function markUnderReview(string $uuid): JsonResponse
    {
        $agent = $this->agents->findByUuid($uuid);
        abort_unless($agent, 404, 'Agent not found.');

        $agent = $this->review->markUnderReview($agent, request()->user());

        return (new AgentAdminDetailResource($agent->load(['user', 'profile', 'documents', 'businessHours', 'submissionHistory'])))->response();
    }

    public function approve(string $uuid): JsonResponse
    {
        $agent = $this->agents->findByUuid($uuid);
        abort_unless($agent, 404, 'Agent not found.');

        $agent = $this->review->approve($agent, request()->user());

        return (new AgentAdminDetailResource($agent->load(['user', 'profile', 'documents', 'businessHours', 'submissionHistory'])))->response();
    }

    public function reject(RejectAgentRequest $request, string $uuid): JsonResponse
    {
        $agent = $this->agents->findByUuid($uuid);
        abort_unless($agent, 404, 'Agent not found.');

        $agent = $this->review->reject($agent, $request->user(), (string) $request->string('reason'));

        return (new AgentAdminDetailResource($agent->load(['user', 'profile', 'documents', 'businessHours', 'submissionHistory'])))->response();
    }
}