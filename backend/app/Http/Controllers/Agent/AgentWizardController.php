<?php
// app/Http/Controllers/Agent/AgentWizardController.php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Http\Requests\Agent\SaveAgencyRequest;
use App\Http\Requests\Agent\SaveBusinessRequest;
use App\Http\Requests\Agent\SaveHoursRequest;
use App\Http\Requests\Agent\UploadDocumentsRequest;
use App\Http\Resources\Agent\AgentWizardResource;
use App\Services\Agent\AgentWizardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AgentWizardController extends Controller
{
    public function __construct(private AgentWizardService $service) {}

    public function show(Request $request): JsonResponse
    {
        $agent = $this->service->getOrCreate($request->user())
            ->load(['profile', 'documents', 'businessHours']);

        return (new AgentWizardResource($agent))->response();
    }

    public function saveAgency(SaveAgencyRequest $request): JsonResponse
    {
        $agent = $this->service->getOrCreate($request->user());
        $agent = $this->service->saveAgency($agent, $request->validated());

        return (new AgentWizardResource($agent->load(['profile', 'documents', 'businessHours'])))->response();
    }

    public function saveBusiness(SaveBusinessRequest $request): JsonResponse
    {
        $agent = $this->service->getOrCreate($request->user());
        $agent = $this->service->saveBusiness($agent, $request->validated());

        return (new AgentWizardResource($agent->load(['profile', 'documents', 'businessHours'])))->response();
    }

    public function uploadDocuments(UploadDocumentsRequest $request): JsonResponse
    {
        $agent = $this->service->getOrCreate($request->user());

        // Map request keys to document types
        $files = [];
        foreach (['business_registration', 'license', 'identity'] as $key) {
            if ($request->hasFile($key)) {
                $files[$key] = $request->file($key);
            }
        }

        $agent = $this->service->uploadDocuments($agent, $files);

        return (new AgentWizardResource($agent->load(['profile', 'documents', 'businessHours'])))->response();
    }

    public function saveHours(SaveHoursRequest $request): JsonResponse
    {
        $agent = $this->service->getOrCreate($request->user());
        $agent = $this->service->saveHours($agent, $request->validated('hours'));

        return (new AgentWizardResource($agent->load(['profile', 'documents', 'businessHours'])))->response();
    }

    public function submit(Request $request): JsonResponse
    {
        $agent = $this->service->getOrCreate($request->user());
        $agent = $this->service->submit($agent);

        return (new AgentWizardResource($agent->load(['profile', 'documents', 'businessHours'])))->response();
    }
}