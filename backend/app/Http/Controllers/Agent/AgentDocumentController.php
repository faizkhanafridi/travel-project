<?php
// app/Http/Controllers/Agent/AgentDocumentController.php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Models\Agent\AgentDocument;
use App\Services\Agent\AgentDocumentService;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AgentDocumentController extends Controller
{
    public function __construct(private AgentDocumentService $service) {}

    public function download(AgentDocument $document): StreamedResponse
    {
        return $this->service->stream(request()->user(), $document);
    }
}