<?php
// app/Http/Controllers/TravelService/Admin/AdminServiceController.php

namespace App\Http\Controllers\TravelService\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\TravelService\Admin\RejectRepublishRequest;
use App\Http\Requests\TravelService\Admin\RejectServiceRequest;
use App\Http\Resources\TravelService\Admin\ServiceAdminListResource;
use App\Http\Resources\TravelService\TravelServiceWizardResource;
use App\Models\TravelService\ServiceRepublishRequest;
use App\Repositories\Contracts\TravelService\TravelServiceRepositoryInterface;
use App\Services\TravelService\TravelServiceAdminService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminServiceController extends Controller
{
    public function __construct(
        private TravelServiceRepositoryInterface $services,
        private TravelServiceAdminService $admin,
    ) {}

    private function load(\App\Models\TravelService\TravelService $s): \App\Models\TravelService\TravelService
    {
        return $s->load(['category', 'subcategory', 'tags', 'inclusions', 'extras', 'images',
            'requirements', 'history', 'agent.user', 'agent.profile',
            'republishRequests' => fn ($q) => $q->latest()]);
    }

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->services->paginateForAdmin($request->only(['status', 'search', 'per_page']));
        return ServiceAdminListResource::collection($paginator)->response();
    }

    public function show(string $uuid): JsonResponse
    {
        $service = $this->services->findByUuid($uuid);
        abort_unless($service, 404, 'Service not found.');
        return (new TravelServiceWizardResource($this->load($service)))->response();
    }

    public function markUnderReview(string $uuid): JsonResponse
    {
        $service = $this->services->findByUuid($uuid);
        abort_unless($service, 404, 'Service not found.');
        $service = $this->admin->markUnderReview($service, request()->user());
        return (new TravelServiceWizardResource($this->load($service)))->response();
    }

    public function approve(string $uuid): JsonResponse
    {
        $service = $this->services->findByUuid($uuid);
        abort_unless($service, 404, 'Service not found.');
        $service = $this->admin->approve($service, request()->user());
        return (new TravelServiceWizardResource($this->load($service)))->response();
    }

    public function reject(RejectServiceRequest $request, string $uuid): JsonResponse
    {
        $service = $this->services->findByUuid($uuid);
        abort_unless($service, 404, 'Service not found.');
        $service = $this->admin->reject($service, $request->user(), (string) $request->string('reason'));
        return (new TravelServiceWizardResource($this->load($service)))->response();
    }

    public function unpublish(string $uuid): JsonResponse
    {
        $service = $this->services->findByUuid($uuid);
        abort_unless($service, 404, 'Service not found.');
        $service = $this->admin->unpublish($service, request()->user());
        return (new TravelServiceWizardResource($this->load($service)))->response();
    }

    public function suspend(string $uuid): JsonResponse
    {
        $service = $this->services->findByUuid($uuid);
        abort_unless($service, 404, 'Service not found.');
        $service = $this->admin->suspend($service, request()->user());
        return (new TravelServiceWizardResource($this->load($service)))->response();
    }

    public function unsuspend(string $uuid): JsonResponse
    {
        $service = $this->services->findByUuid($uuid);
        abort_unless($service, 404, 'Service not found.');
        $service = $this->admin->unsuspend($service, request()->user());
        return (new TravelServiceWizardResource($this->load($service)))->response();
    }

    public function approveRepublish(string $requestUuid): JsonResponse
    {
        $republish = ServiceRepublishRequest::where('uuid', $requestUuid)->first();
        abort_unless($republish, 404, 'Republish request not found.');
        $service = $this->admin->approveRepublish($republish, request()->user());
        return (new TravelServiceWizardResource($this->load($service)))->response();
    }

    public function rejectRepublish(RejectRepublishRequest $request, string $requestUuid): JsonResponse
    {
        $republish = ServiceRepublishRequest::where('uuid', $requestUuid)->first();
        abort_unless($republish, 404, 'Republish request not found.');
        $this->admin->rejectRepublish($republish, $request->user(), (string) $request->string('reason'));
        return response()->json(['message' => 'Republish request rejected.']);
    }
}