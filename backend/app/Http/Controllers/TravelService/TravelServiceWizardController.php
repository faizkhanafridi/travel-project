<?php
// app/Http/Controllers/TravelService/TravelServiceWizardController.php

namespace App\Http\Controllers\TravelService;

use App\Http\Controllers\Controller;
use App\Http\Requests\TravelService\RepublishRequest;
use App\Http\Requests\TravelService\SaveBasicRequest;
use App\Http\Requests\TravelService\SaveDetailsRequest;
use App\Http\Requests\TravelService\SaveRequirementsRequest;
use App\Http\Requests\TravelService\UpdateGalleryOrderRequest;
use App\Http\Requests\TravelService\UploadGalleryRequest;
use App\Http\Resources\TravelService\TravelServiceWizardResource;
use App\Models\Agent\Agent;
use App\Models\TravelService\TravelService;
use App\Repositories\Contracts\TravelService\TravelServiceRepositoryInterface;
use App\Services\TravelService\TravelServiceDeletionService;
use App\Services\TravelService\TravelServiceRepublishService;
use App\Services\TravelService\TravelServiceWizardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TravelServiceWizardController extends Controller
{
    public function __construct(
        private TravelServiceWizardService $wizard,
        private TravelServiceRepositoryInterface $services,
        private TravelServiceDeletionService $deletion,
        private TravelServiceRepublishService $republish,
    ) {}

    private function requireAgent(Request $request): Agent
    {
        $agent = Agent::where('user_id', $request->user()->id)->first();
        abort_unless($agent && $agent->status === \App\Enums\Agent\AgentStatus::APPROVED, 403, 'Only approved agents can manage services.');
        return $agent;
    }

    private function load(TravelService $service): TravelService
    {
        return $service->load(['category', 'subcategory', 'tags', 'inclusions', 'extras', 'images', 'requirements', 'republishRequests' => fn ($q) => $q->latest()]);
    }

    public function index(Request $request): JsonResponse
    {
        $agent = $this->requireAgent($request);
        $paginator = $this->services->paginateForAgent($agent, $request->only(['status', 'search', 'per_page']));

        return response()->json($paginator->through(fn ($s) => [
            'uuid' => $s->uuid,
            'title' => $s->title,
            'status' => $s->status?->value,
            'price' => (float) $s->price,
            'currency' => 'USD',
            'category' => $s->category?->name,
            'subcategory' => $s->subcategory?->name,
            'cover_image_url' => $s->images->first()?->uuid ? url("/api/services/images/{$s->images->first()->uuid}") : null,
            'attempt' => $s->attempt,
            'submitted_at' => $s->submitted_at?->toIso8601String(),
            'published_at' => $s->published_at?->toIso8601String(),
        ]));
    }

    public function create(Request $request): JsonResponse
    {
        $agent = $this->requireAgent($request);
        $service = $this->wizard->create($agent);

        return (new TravelServiceWizardResource($this->load($service)))->response()->setStatusCode(201);
    }

    public function show(Request $request, string $uuid): JsonResponse
    {
        $agent = $this->requireAgent($request);
        $service = $this->services->findByUuidForAgent($uuid, $agent);
        abort_unless($service, 404, 'Service not found.');

        return (new TravelServiceWizardResource($this->load($service)))->response();
    }

    public function saveBasic(SaveBasicRequest $request, string $uuid): JsonResponse
    {
        $agent = $this->requireAgent($request);
        $service = $this->services->findByUuidForAgent($uuid, $agent);
        abort_unless($service, 404, 'Service not found.');

        $service = $this->wizard->saveBasic($service, $request->validated());

        return (new TravelServiceWizardResource($this->load($service)))->response();
    }

    public function saveDetails(SaveDetailsRequest $request, string $uuid): JsonResponse
    {
        $agent = $this->requireAgent($request);
        $service = $this->services->findByUuidForAgent($uuid, $agent);
        abort_unless($service, 404, 'Service not found.');

        $service = $this->wizard->saveDetails($service, $request->validated());

        return (new TravelServiceWizardResource($this->load($service)))->response();
    }

    public function uploadGallery(UploadGalleryRequest $request, string $uuid): JsonResponse
    {
        $agent = $this->requireAgent($request);
        $service = $this->services->findByUuidForAgent($uuid, $agent);
        abort_unless($service, 404, 'Service not found.');

        $service = $this->wizard->uploadGallery(
            $service,
            $request->file('cover'),
            $request->file('images', []),
        );

        return (new TravelServiceWizardResource($this->load($service)))->response();
    }

    public function reorderGallery(UpdateGalleryOrderRequest $request, string $uuid): JsonResponse
    {
        $agent = $this->requireAgent($request);
        $service = $this->services->findByUuidForAgent($uuid, $agent);
        abort_unless($service, 404, 'Service not found.');

        $service = $this->wizard->reorderGallery($service, $request->input('order'), (string) $request->input('cover_uuid'));

        return (new TravelServiceWizardResource($this->load($service)))->response();
    }

    public function deleteImage(Request $request, string $uuid, string $imageUuid): JsonResponse
    {
        $agent = $this->requireAgent($request);
        $service = $this->services->findByUuidForAgent($uuid, $agent);
        abort_unless($service, 404, 'Service not found.');

        $service = $this->wizard->deleteImage($service, $imageUuid);

        return (new TravelServiceWizardResource($this->load($service)))->response();
    }

    public function saveRequirements(SaveRequirementsRequest $request, string $uuid): JsonResponse
    {
        $agent = $this->requireAgent($request);
        $service = $this->services->findByUuidForAgent($uuid, $agent);
        abort_unless($service, 404, 'Service not found.');

        $service = $this->wizard->saveRequirements($service, $request->input('requirements'));

        return (new TravelServiceWizardResource($this->load($service)))->response();
    }

    public function submit(Request $request, string $uuid): JsonResponse
    {
        $agent = $this->requireAgent($request);
        $service = $this->services->findByUuidForAgent($uuid, $agent);
        abort_unless($service, 404, 'Service not found.');

        $service = $this->wizard->submit($service);

        return (new TravelServiceWizardResource($this->load($service)))->response();
    }

    public function requestRepublish(RepublishRequest $request, string $uuid): JsonResponse
    {
        $agent = $this->requireAgent($request);
        $service = $this->services->findByUuidForAgent($uuid, $agent);
        abort_unless($service, 404, 'Service not found.');

        $this->republish->request($service, $agent, (string) $request->string('reason'));

        return (new TravelServiceWizardResource($this->load($service->fresh())))->response();
    }

    public function destroy(Request $request, string $uuid): JsonResponse
    {
        $agent = $this->requireAgent($request);
        // allow deleting SUSPENDED too — fetch without the suspended filter
        $service = TravelService::where('uuid', $uuid)->where('agent_id', $agent->id)->first();
        abort_unless($service, 404, 'Service not found.');

        $this->deletion->delete($service, $agent);

        return response()->json(['message' => 'Service deleted.']);
    }
}