<?php
// app/Services/Agent/AgentDocumentService.php

namespace App\Services\Agent;

use App\Models\Agent\AgentDocument;
use App\Models\Auth\User;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class AgentDocumentService
{
    public function stream(User $viewer, AgentDocument $document): StreamedResponse
    {
        $agent = $document->agent;
        if (! $agent) {
            throw new AccessDeniedHttpException('Document not found.');
        }

        $isOwner = $agent->user_id === $viewer->id;
        $isAdmin = $viewer->hasRole('super_admin');

        if (! $isOwner && ! $isAdmin) {
            throw new AccessDeniedHttpException('Not authorized.');
        }

        $disk = Storage::disk('private');
        if (! $disk->exists($document->file_path)) {
            throw new AccessDeniedHttpException('Document not found.');
        }

        return $disk->response($document->file_path, $document->original_name, [
            'Content-Type' => $document->mime_type,
            'Cache-Control' => 'private, no-store',
        ]);
    }
}