<?php

namespace App\Http\Resources\Agent;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AgentDocumentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'uuid' => $this->uuid,
            'type' => $this->type,
            'original_name' => $this->original_name,
            'mime' => $this->mime,
            'size' => $this->size,
            'is_approved' => (bool) $this->is_approved,
            'uploaded_at' => $this->created_at?->toIso8601String(),
            // Never expose storage_path — caller must use the download endpoint.
            'download_url' => url("/api/agent/documents/{$this->uuid}/download"),
        ];
    }
}