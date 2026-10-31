<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Http\Requests\Agent\UploadDocumentRequest;
use App\Http\Resources\Agent\AgentDocumentResource;
use App\Services\Agent\AgentDocumentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AgentDocumentController extends Controller
{
    public function __construct(
        private AgentDocumentService $documentService,
    ) {}

    // POST /api/agent/documents
    public function store(UploadDocumentRequest $request): JsonResponse
    {
        $agent = $request->user()->agent;

        if (! $agent) {
            throw ValidationException::withMessages(['agent' => ['Start an application first.']]);
        }

        $doc = $this->documentService->upload(
            $agent,
            $request->string('type')->toString(),
            $request->file('file'),
        );

        return response()->json([
            'success' => true,
            'message' => 'Document uploaded.',
            'data' => new AgentDocumentResource($doc),
        ], 201);
    }

    // DELETE /api/agent/documents/{uuid}
    public function destroy(Request $request, string $uuid): JsonResponse
    {
        $agent = $request->user()->agent;

        if (! $agent) {
            throw ValidationException::withMessages(['agent' => ['No application found.']]);
        }

        $this->documentService->delete($agent, $uuid);

        return response()->json([
            'success' => true,
            'message' => 'Document deleted.',
            'data' => null,
        ]);
    }

    // GET /api/agent/documents/{uuid}/download
    public function download(Request $request, string $uuid)
    {
        $agent = $request->user()->agent;

        if (! $agent) {
            throw ValidationException::withMessages(['agent' => ['No application found.']]);
        }

        return $this->documentService->download($agent, $uuid);
    }
}