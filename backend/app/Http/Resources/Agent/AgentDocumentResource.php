<?php
// app/Http/Resources/Agent/AgentDocumentResource.php

namespace App\Http\Resources\Agent;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AgentDocumentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'uuid' => $this->uuid,
            'type' => $this->type?->value,
            'original_name' => $this->original_name,
            'mime_type' => $this->mime_type,
            'size_bytes' => $this->size_bytes,
            'locked' => $this->locked_at !== null,
            'download_url' => url("/api/agent/documents/{$this->uuid}"),
            'uploaded_at' => $this->created_at?->toIso8601String(),
        ];
    }
}