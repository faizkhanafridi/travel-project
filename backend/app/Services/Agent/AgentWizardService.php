<?php
// app/Services/Agent/AgentWizardService.php

namespace App\Services\Agent;

use App\Enums\Agent\AgentDocumentType;
use App\Enums\Agent\AgentStatus;
use App\Models\Agent\Agent;
use App\Models\Auth\User;
use App\Repositories\Contracts\Agent\AgentRepositoryInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class AgentWizardService
{
    public const MAX_FILE_SIZE_KB = 10240; // 10 MB
    public const ALLOWED_MIMES = ['pdf', 'jpg', 'jpeg', 'png', 'webp'];

    public function __construct(private AgentRepositoryInterface $agents) {}

    public function getOrCreate(User $user): Agent
    {
        $agent = $this->agents->findByUser($user);
        if ($agent) {
            return $agent;
        }

        return $this->agents->createForUser($user);
    }

  public function assertEditable(Agent $agent): void
{
    if (! $agent->status->isWizardEditable()) {
        throw new AccessDeniedHttpException('Application cannot be edited in its current state.');
    }
}
    public function saveAgency(Agent $agent, array $data): Agent
    {
        $this->assertEditable($agent);

        return DB::transaction(function () use ($agent, $data) {
            $this->upsertProfile($agent, [
                'agency_name' => $data['agency_name'],
                'agency_owner_name' => $data['agency_owner_name'],
                'agency_phone' => $data['agency_phone'] ?? null,
                'agency_country' => $data['agency_country'],
                'agency_city' => $data['agency_city'],
                'agency_address' => $data['agency_address'],
            ]);

            return $this->agents->update($agent, ['step_agency_saved' => true]);
        });
    }

    public function saveBusiness(Agent $agent, array $data): Agent
    {
        $this->assertEditable($agent);
        $this->assertStepSaved($agent, 'step_agency_saved', 'Agency information must be saved first.');

        return DB::transaction(function () use ($agent, $data) {
            $this->upsertProfile($agent, [
                'business_description' => $data['business_description'],
                'years_in_business' => (int) $data['years_in_business'],
                'business_type' => $data['business_type'],
                'registration_number' => $data['registration_number'] ?? null,
                'website' => $data['website'] ?? null,
                'social_media' => $data['social_media'] ?? null,
                'languages' => $data['languages'] ?? null,
                'specializations' => $data['specializations'] ?? null,
            ]);

            return $this->agents->update($agent, ['step_business_saved' => true]);
        });
    }

    public function uploadDocuments(Agent $agent, array $files): Agent
    {
        $this->assertEditable($agent);
        $this->assertStepSaved($agent, 'step_business_saved', 'Business information must be saved first.');

        return DB::transaction(function () use ($agent, $files) {
            foreach ($files as $type => $file) {
                if (! $file instanceof UploadedFile) {
                    continue;
                }
                $this->validateUpload($file);

                // Replace any existing doc of the same type (unless locked)
                $existing = $agent->documents()->where('type', $type)->first();
                if ($existing) {
                    if ($existing->locked_at) {
                        throw new UnprocessableEntityHttpException('Approved documents cannot be replaced.');
                    }
                    Storage::disk('private')->delete($existing->file_path);
                    $existing->delete();
                }

                $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs("agent-documents/{$agent->uuid}", $filename, 'private');

                $agent->documents()->create([
                    'uuid' => (string) Str::uuid(),
                    'type' => $type,
                    'original_name' => $file->getClientOriginalName(),
                    'file_path' => $path,
                    'mime_type' => $file->getMimeType(),
                    'size_bytes' => $file->getSize(),
                ]);
            }

            $required = [
                AgentDocumentType::BUSINESS_REGISTRATION->value,
                AgentDocumentType::LICENSE->value,
                AgentDocumentType::IDENTITY->value,
            ];
            $present = $agent->documents()->pluck('type')->map(fn ($t) => $t->value)->all();
            $missing = array_diff($required, $present);
            if (! empty($missing)) {
                throw new UnprocessableEntityHttpException('Missing required documents: ' . implode(', ', $missing));
            }

            return $this->agents->update($agent, ['step_documents_saved' => true]);
        });
    }

    public function saveHours(Agent $agent, array $hours): Agent
    {
        $this->assertEditable($agent);
        $this->assertStepSaved($agent, 'step_documents_saved', 'Documents must be saved first.');

        return DB::transaction(function () use ($agent, $hours) {
            $agent->businessHours()->delete();
            foreach ($hours as $row) {
                $agent->businessHours()->create([
                    'day_of_week' => (int) $row['day_of_week'],
                    'is_closed' => (bool) ($row['is_closed'] ?? false),
                    'open_time' => $row['open_time'] ?? null,
                    'close_time' => $row['close_time'] ?? null,
                ]);
            }

            return $this->agents->update($agent, ['step_hours_saved' => true]);
        });
    }

    public function submit(Agent $agent): Agent
    {
        $this->assertEditable($agent);

        $missing = [];
        if (! $agent->step_agency_saved) $missing[] = 'agency information';
        if (! $agent->step_business_saved) $missing[] = 'business information';
        if (! $agent->step_documents_saved) $missing[] = 'documents';
        if (! $agent->step_hours_saved) $missing[] = 'business hours';

        if (! empty($missing)) {
            throw new UnprocessableEntityHttpException('Cannot submit — incomplete: ' . implode(', ', $missing));
        }

        return DB::transaction(function () use ($agent) {
            $attempt = $agent->attempt + 1;
            $updated = $this->agents->update($agent, [
                'status' => AgentStatus::PENDING_REVIEW->value,
                'attempt' => $attempt,
                'submitted_at' => now(),
                'rejection_reason' => null,
            ]);

            $updated->submissionHistory()->create([
                'uuid' => (string) Str::uuid(),
                'attempt' => $attempt,
                'action' => 'submitted',
                'snapshot' => $this->snapshot($updated),
            ]);

            return $updated;
        });
    }

    private function upsertProfile(Agent $agent, array $data): void
    {
        $profile = $agent->profile;
        if ($profile) {
            $profile->fill($data)->save();
        } else {
            $agent->profile()->create(array_merge([
                'uuid' => (string) Str::uuid(),
            ], $data));
        }
    }

    private function assertStepSaved(Agent $agent, string $flag, string $message): void
    {
        if (! $agent->{$flag}) {
            throw new UnprocessableEntityHttpException($message);
        }
    }

    private function validateUpload(UploadedFile $file): void
    {
        if ($file->getSize() > self::MAX_FILE_SIZE_KB * 1024) {
            throw new UnprocessableEntityHttpException('Each file must not exceed 10 MB.');
        }
        $ext = strtolower($file->getClientOriginalExtension());
        if (! in_array($ext, self::ALLOWED_MIMES, true)) {
            throw new UnprocessableEntityHttpException('Allowed formats: PDF, JPG, PNG, WEBP.');
        }
        $mime = $file->getMimeType();
        if (! in_array($mime, ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'], true)) {
            throw new UnprocessableEntityHttpException('Invalid file type.');
        }
    }

    private function snapshot(Agent $agent): array
    {
        $agent->loadMissing(['profile', 'documents', 'businessHours']);
        return [
            'agency' => $agent->profile?->only([
                'agency_name', 'agency_owner_name', 'agency_phone',
                'agency_country', 'agency_city', 'agency_address',
            ]),
            'business' => $agent->profile?->only([
                'business_description', 'years_in_business', 'business_type',
                'registration_number', 'website', 'social_media',
                'languages', 'specializations',
            ]),
            'documents' => $agent->documents->map(fn ($d) => [
                'uuid' => $d->uuid,
                'type' => $d->type->value,
                'original_name' => $d->original_name,
                'size_bytes' => $d->size_bytes,
            ])->all(),
            'hours' => $agent->businessHours->map(fn ($h) => [
                'day_of_week' => $h->day_of_week,
                'is_closed' => $h->is_closed,
                'open_time' => $h->open_time,
                'close_time' => $h->close_time,
            ])->all(),
        ];
    }
}