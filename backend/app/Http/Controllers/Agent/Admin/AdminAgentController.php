<?php

namespace App\Http\Controllers\Agent\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Agent\RejectApplicationRequest;
use App\Http\Requests\Agent\SuspendAgentRequest;
use App\Http\Resources\Agent\AdminAgentResource;
use App\Models\Agent\Agent;
use App\Repositories\Contracts\Agent\AgentRepositoryInterface;
use App\Services\Agent\AgentDocumentService;
use App\Services\Agent\AgentReviewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AdminAgentController extends Controller
{
    public function __construct(
        private AgentRepositoryInterface $agentRepo,
        private AgentReviewService $reviewService,
        private AgentDocumentService $documentService,
    ) {}

    // GET /api/admin/agents
    public function index(Request $request): JsonResponse
    {
        $filters = [
            'status' => $request->query('status'),
            'search' => $request->query('search'),
        ];

        $agents = $this->agentRepo->paginateForAdmin($filters, (int) $request->query('per_page', 20));

        return response()->json([
            'success' => true,
            'message' => 'Applications retrieved.',
            'data' => AdminAgentResource::collection($agents->items()),
            'meta' => [
                'current_page' => $agents->currentPage(),
                'per_page' => $agents->perPage(),
                'total' => $agents->total(),
                'last_page' => $agents->lastPage(),
            ],
        ]);
    }

    // GET /api/admin/agents/{uuid}
    public function show(string $uuid): JsonResponse
    {
        $agent = $this->findAgent($uuid);
        $agent->load(['user', 'profile', 'documents', 'businessHours', 'attempts', 'events.actor']);

        return response()->json([
            'success' => true,
            'message' => 'Application retrieved.',
            'data' => new AdminAgentResource($agent),
        ]);
    }

    // POST /api/admin/agents/{uuid}/under-review
    public function markUnderReview(Request $request, string $uuid): JsonResponse
    {
        $agent = $this->findAgent($uuid);
        $agent = $this->reviewService->markUnderReview($agent, $request->user());

        return response()->json([
            'success' => true,
            'message' => 'Application marked as under review.',
            'data' => new AdminAgentResource($agent->load(['user', 'profile', 'attempts'])),
        ]);
    }

    // POST /api/admin/agents/{uuid}/approve
    public function approve(Request $request, string $uuid): JsonResponse
    {
        $agent = $this->findAgent($uuid);
        $agent = $this->reviewService->approve($agent, $request->user());

        return response()->json([
            'success' => true,
            'message' => 'Agent approved.',
            'data' => new AdminAgentResource($agent->load(['user', 'profile', 'attempts'])),
        ]);
    }

    // POST /api/admin/agents/{uuid}/reject
    public function reject(RejectApplicationRequest $request, string $uuid): JsonResponse
    {
        $agent = $this->findAgent($uuid);
        $agent = $this->reviewService->reject(
            $agent,
            $request->user(),
            $request->string('rejection_reason')->toString(),
        );

        return response()->json([
            'success' => true,
            'message' => 'Application rejected.',
            'data' => new AdminAgentResource($agent->load(['user', 'profile', 'attempts'])),
        ]);
    }

    // POST /api/admin/agents/{uuid}/suspend
    public function suspend(SuspendAgentRequest $request, string $uuid): JsonResponse
    {
        $agent = $this->findAgent($uuid);
        $agent = $this->reviewService->suspend(
            $agent,
            $request->user(),
            $request->string('reason')->toString(),
        );

        return response()->json([
            'success' => true,
            'message' => 'Agent suspended.',
            'data' => new AdminAgentResource($agent->load(['user', 'profile', 'attempts'])),
        ]);
    }

    // POST /api/admin/agents/{uuid}/unsuspend
    public function unsuspend(Request $request, string $uuid): JsonResponse
    {
        $agent = $this->findAgent($uuid);
        $agent = $this->reviewService->unsuspend($agent, $request->user());

        return response()->json([
            'success' => true,
            'message' => 'Agent unsuspended.',
            'data' => new AdminAgentResource($agent->load(['user', 'profile', 'attempts'])),
        ]);
    }

    // GET /api/admin/agents/{uuid}/documents/{docUuid}/download
    public function downloadDocument(string $uuid, string $docUuid)
    {
        $agent = $this->findAgent($uuid);

        return $this->documentService->download($agent, $docUuid);
    }

    private function findAgent(string $uuid): Agent
    {
        $agent = $this->agentRepo->findByUuid($uuid);

        if (! $agent) {
            throw ValidationException::withMessages(['agent' => ['Application not found.']]);
        }

        return $agent;
    }
}