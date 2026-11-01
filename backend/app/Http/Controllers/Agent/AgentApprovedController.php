<?php
// app/Http/Controllers/Agent/AgentApprovedController.php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Http\Requests\Agent\SaveHoursRequest;
use App\Http\Requests\Agent\SaveAgencyRequest;
use App\Http\Requests\Agent\SaveBusinessRequest;
use App\Http\Resources\Agent\AgentWizardResource;
use App\Enums\Agent\AgentStatus;
use App\Models\Agent\Agent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class AgentApprovedController extends Controller
{
    private function getApproved(Request $request): Agent
    {
        $agent = Agent::with(['profile', 'documents', 'businessHours'])
            ->where('user_id', $request->user()->id)
            ->first();

        if (! $agent || $agent->status !== AgentStatus::APPROVED) {
            throw new AccessDeniedHttpException('Only approved agents can edit agency information.');
        }

        return $agent;
    }

    public function show(Request $request): JsonResponse
    {
        return (new AgentWizardResource($this->getApproved($request)))->response();
    }

    public function updateAgency(SaveAgencyRequest $request, \App\Services\Agent\AgentWizardService $wizard): JsonResponse
    {
        $agent = $wizard->saveAgency($this->getApproved($request), $request->validated());
        return (new AgentWizardResource($agent->load(['profile', 'documents', 'businessHours'])))->response();
    }

    public function updateBusiness(SaveBusinessRequest $request, \App\Services\Agent\AgentWizardService $wizard): JsonResponse
    {
        $agent = $wizard->saveBusiness($this->getApproved($request), $request->validated());
        return (new AgentWizardResource($agent->load(['profile', 'documents', 'businessHours'])))->response();
    }

    public function updateHours(SaveHoursRequest $request, \App\Services\Agent\AgentWizardService $wizard): JsonResponse
    {
        $agent = $wizard->saveHours($this->getApproved($request), $request->validated('hours'));
        return (new AgentWizardResource($agent->load(['profile', 'documents', 'businessHours'])))->response();
    }
}