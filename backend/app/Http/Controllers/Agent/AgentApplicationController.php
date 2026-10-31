<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Http\Requests\Agent\SaveAgencyInformationRequest;
use App\Http\Requests\Agent\SaveBusinessHoursRequest;
use App\Http\Requests\Agent\SaveBusinessInformationRequest;
use App\Http\Resources\Agent\AgentResource;
use App\Services\Agent\AgentApplicationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AgentApplicationController extends Controller
{
    public function __construct(
        private AgentApplicationService $applicationService,
    ) {}

    // GET /api/agent/application — returns current application or null.
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        $agent = $user->agent; // relationship added below

        return response()->json([
            'success' => true,
            'message' => $agent ? 'Application retrieved.' : 'No agent application yet.',
            'data' => $agent ? new AgentResource(
                $agent->load(['profile', 'documents', 'businessHours', 'attempts'])
            ) : null,
        ]);
    }

    // POST /api/agent/application/start — creates or resumes draft.
    public function start(Request $request): JsonResponse
    {
        $agent = $this->applicationService->startOrResume($request->user());

        return response()->json([
            'success' => true,
            'message' => 'Application started.',
            'data' => new AgentResource(
                $agent->load(['profile', 'documents', 'businessHours', 'attempts'])
            ),
        ]);
    }

    // PUT /api/agent/application/agency
    public function saveAgency(SaveAgencyInformationRequest $request): JsonResponse
    {
        $agent = $this->requireEditable($request);
        $agent = $this->applicationService->saveAgencyInfo($agent, $request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Agency information saved.',
            'data' => new AgentResource(
                $agent->load(['profile', 'documents', 'businessHours', 'attempts'])
            ),
        ]);
    }

    // PUT /api/agent/application/business
    public function saveBusiness(SaveBusinessInformationRequest $request): JsonResponse
    {
        $agent = $this->requireEditable($request);
        $agent = $this->applicationService->saveBusinessInfo($agent, $request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Business information saved.',
            'data' => new AgentResource(
                $agent->load(['profile', 'documents', 'businessHours', 'attempts'])
            ),
        ]);
    }

    // PUT /api/agent/application/business-hours
    public function saveHours(SaveBusinessHoursRequest $request): JsonResponse
    {
        $agent = $this->requireEditable($request);
        $agent = $this->applicationService->saveBusinessHours(
            $agent,
            $request->validated()['hours'],
        );

        return response()->json([
            'success' => true,
            'message' => 'Business hours saved.',
            'data' => new AgentResource(
                $agent->load(['profile', 'documents', 'businessHours', 'attempts'])
            ),
        ]);
    }

    // GET /api/agent/application/review — shows review payload only if ready.
    public function review(Request $request): JsonResponse
    {
        $user = $request->user();
        $agent = $user->agent;

        if (! $agent) {
            throw ValidationException::withMessages(['agent' => ['Start an application first.']]);
        }

        $this->applicationService->assertReadyForReview($agent);

        return response()->json([
            'success' => true,
            'message' => 'Ready for review.',
            'data' => new AgentResource(
                $agent->load(['profile', 'documents', 'businessHours', 'attempts'])
            ),
        ]);
    }

    // POST /api/agent/application/submit
    public function submit(Request $request): JsonResponse
    {
        $user = $request->user();
        $agent = $user->agent;

        if (! $agent) {
            throw ValidationException::withMessages(['agent' => ['Start an application first.']]);
        }

        $agent = $this->applicationService->submit($agent, $user);

        return response()->json([
            'success' => true,
            'message' => 'Application submitted. It is now pending review.',
            'data' => new AgentResource(
                $agent->load(['profile', 'documents', 'businessHours', 'attempts'])
            ),
        ]);
    }

    private function requireEditable(Request $request)
    {
        $agent = $request->user()->agent;

        if (! $agent) {
            throw ValidationException::withMessages(['agent' => ['Start an application first.']]);
        }

        return $agent;
    }
}