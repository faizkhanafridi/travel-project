<?php

namespace App\Services\Agent;

use App\Enums\Agent\DocumentType;
use App\Models\Agent\Agent;
use App\Models\Agent\AgentDocument;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class AgentDocumentService
{
    public function upload(Agent $agent, string $type, UploadedFile $file): AgentDocument
    {
        $this->assertEditable($agent);
        $this->assertBusinessCompleted($agent);

        if (! in_array($type, array_map(fn ($t) => $t->value, DocumentType::cases()), true)) {
            throw ValidationException::withMessages(['type' => ['Invalid document type.']]);
        }

        $disk = config('agent.document_disk');
        $path = config('agent.document_path');

        // Replace existing file for the same fixed type (business_registration / license / identity).
        // "other" type can have many files.
        if ($type !== DocumentType::OTHER->value) {
            foreach ($agent->documents()->where('type', $type)->get() as $doc) {
                Storage::disk($disk)->delete($doc->storage_path);
                $doc->delete();
            }
        }

        // Store on private disk with a random filename; never trust client name.
        $storedPath = $file->store($path, $disk);

        return DB::transaction(function () use ($agent, $type, $file, $storedPath) {
            $agent->documents()->create([
                'type' => $type,
                'original_name' => $file->getClientOriginalName(),
                'storage_path' => $storedPath,
                'mime' => $file->getMimeType(),
                'size' => $file->getSize(),
            ]);

            return $agent->documents()->latest('id')->first();
        });
    }

    public function delete(Agent $agent, string $uuid): void
    {
        $this->assertEditable($agent);

        $doc = $agent->documents()->where('uuid', $uuid)->first();

        if (! $doc) {
            throw ValidationException::withMessages(['document' => ['Document not found.']]);
        }

        DB::transaction(function () use ($doc) {
            Storage::disk(config('agent.document_disk'))->delete($doc->storage_path);
            $doc->delete();
        });
    }

    /**
     * Stream a private document. Caller must have already authorized
     * (owner or admin). Path never exposed publicly.
     */
    public function download(Agent $agent, string $uuid)
    {
        $doc = $agent->documents()->where('uuid', $uuid)->first();

        if (! $doc) {
            throw ValidationException::withMessages(['document' => ['Document not found.']]);
        }

        $disk = Storage::disk(config('agent.document_disk'));

        if (! $disk->exists($doc->storage_path)) {
            throw ValidationException::withMessages(['document' => ['File is missing on storage.']]);
        }

        return $disk->download($doc->storage_path, $doc->original_name);
    }

    private function assertEditable(Agent $agent): void
    {
        if (! $agent->isEditable()) {
            throw ValidationException::withMessages([
                'agent' => ['Documents cannot be edited in the current application status.'],
            ]);
        }
    }

    private function assertBusinessCompleted(Agent $agent): void
    {
        if (! $agent->profile || ! $agent->profile->business_information_completed) {
            throw ValidationException::withMessages([
                'step' => ['Complete business information before uploading documents.'],
            ]);
        }
    }
}