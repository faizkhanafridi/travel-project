<?php
// app/Services/TravelService/TravelServiceWizardService.php

namespace App\Services\TravelService;

use App\Enums\TravelService\TravelServiceStatus;
use App\Models\Agent\Agent;
use App\Models\TravelService\ServiceCategory;
use App\Models\TravelService\TravelService;
use App\Repositories\Contracts\TravelService\TravelServiceRepositoryInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class TravelServiceWizardService
{
    public function __construct(private TravelServiceRepositoryInterface $services) {}

    public function create(Agent $agent): TravelService
    {
        return $this->services->create([
            'agent_id' => $agent->id,
            'category_id' => null,
            'subcategory_id' => null,
            'title' => 'Untitled draft',
            'slug' => 'draft-' . Str::lower(Str::random(8)),
            'full_description' => '',
            'price' => 0,
            'currency' => 'USD',
            'destination_country' => '',
            'destination_city' => '',
            'duration' => 1,
            'duration_unit' => 'days',
            'status' => TravelServiceStatus::DRAFT->value,
            'attempt' => 0,
        ]);
    }

    public function assertEditable(TravelService $service): void
    {
        if (! $service->status->isEditable()) {
            throw new AccessDeniedHttpException('Service cannot be edited in its current state.');
        }
    }

    public function saveBasic(TravelService $service, array $data): TravelService
    {
        $this->assertEditable($service);

        $sub = ServiceCategory::find($data['subcategory_id']);
        $cat = ServiceCategory::find($data['category_id']);
        if (! $cat || $cat->parent_id !== null) {
            throw new UnprocessableEntityHttpException('Invalid category.');
        }
        if (! $sub || $sub->parent_id !== $cat->id) {
            throw new UnprocessableEntityHttpException('Subcategory does not belong to the selected category.');
        }

        return DB::transaction(function () use ($service, $data) {
            $slug = Str::slug($data['title']) . '-' . Str::lower(Str::random(6));
            $updated = $this->services->update($service, [
                'title' => $data['title'],
                'slug' => $slug,
                'category_id' => $data['category_id'],
                'subcategory_id' => $data['subcategory_id'],
                'step_basic_saved' => true,
            ]);

            $updated->tags()->delete();
            foreach (array_unique($data['tags']) as $tag) {
                $updated->tags()->create(['tag' => $tag]);
            }

            return $updated->fresh();
        });
    }

    public function saveDetails(TravelService $service, array $data): TravelService
    {
        $this->assertEditable($service);
        if (! $service->step_basic_saved) {
            throw new UnprocessableEntityHttpException('Save basic information first.');
        }

        return DB::transaction(function () use ($service, $data) {
            $updated = $this->services->update($service, [
                'short_description' => $data['short_description'] ?? null,
                'full_description' => $data['full_description'],
                'price' => $data['price'],
                'currency' => 'USD',
                'destination_country' => $data['destination_country'],
                'destination_city' => $data['destination_city'],
                'duration' => $data['duration'],
                'duration_unit' => $data['duration_unit'],
                'cancellation_policy' => $data['cancellation_policy'] ?? null,
                'step_details_saved' => true,
            ]);

            $updated->inclusions()->delete();
            foreach (array_values($data['inclusions']) as $i => $label) {
                $updated->inclusions()->create(['label' => $label, 'sort_order' => $i]);
            }

            $updated->extras()->delete();
            foreach ($data['extras'] ?? [] as $i => $extra) {
                $updated->extras()->create([
                    'uuid' => (string) Str::uuid(),
                    'label' => $extra['label'],
                    'price' => $extra['price'],
                    'currency' => 'USD',
                    'description' => $extra['description'] ?? null,
                    'sort_order' => $i,
                ]);
            }

            return $updated->fresh();
        });
    }

    public function uploadGallery(TravelService $service, UploadedFile $cover, array $extraImages): TravelService
    {
        $this->assertEditable($service);
        if (! $service->step_details_saved) {
            throw new UnprocessableEntityHttpException('Save details first.');
        }

        return DB::transaction(function () use ($service, $cover, $extraImages) {
            $path = $this->storeImage($service, $cover);
            $service->images()->create([
                'uuid' => (string) Str::uuid(),
                'file_path' => $path,
                'mime_type' => $cover->getMimeType(),
                'size_bytes' => $cover->getSize(),
                'is_cover' => true,
                'sort_order' => 0,
            ]);

            $i = 1;
            foreach ($extraImages as $img) {
                if (! $img instanceof UploadedFile) continue;
                $p = $this->storeImage($service, $img);
                $service->images()->create([
                    'uuid' => (string) Str::uuid(),
                    'file_path' => $p,
                    'mime_type' => $img->getMimeType(),
                    'size_bytes' => $img->getSize(),
                    'is_cover' => false,
                    'sort_order' => $i++,
                ]);
            }

            return $this->services->update($service, ['step_gallery_saved' => true]);
        });
    }

    public function reorderGallery(TravelService $service, array $orderedUuids, string $coverUuid): TravelService
    {
        $this->assertEditable($service);

        return DB::transaction(function () use ($service, $orderedUuids, $coverUuid) {
            $images = $service->images()->get()->keyBy('uuid');
            $i = 0;
            foreach ($orderedUuids as $uuid) {
                if (! isset($images[$uuid])) continue;
                $images[$uuid]->update(['sort_order' => $i++, 'is_cover' => $uuid === $coverUuid]);
            }
            return $service->fresh();
        });
    }

    public function deleteImage(TravelService $service, string $imageUuid): TravelService
    {
        $this->assertEditable($service);
        $image = $service->images()->where('uuid', $imageUuid)->first();
        if (! $image) {
            throw new UnprocessableEntityHttpException('Image not found.');
        }
        if ($image->is_cover) {
            throw new UnprocessableEntityHttpException('Upload a new cover before deleting the current one.');
        }
        Storage::disk('private')->delete($image->file_path);
        $image->delete();
        return $service->fresh();
    }

    public function saveRequirements(TravelService $service, array $requirements): TravelService
    {
        $this->assertEditable($service);
        if (! $service->step_gallery_saved) {
            throw new UnprocessableEntityHttpException('Save gallery first.');
        }

        return DB::transaction(function () use ($service, $requirements) {
            $service->requirements()->delete();
            foreach (array_values($requirements) as $i => $req) {
                $service->requirements()->create([
                    'uuid' => (string) Str::uuid(),
                    'title' => $req['title'],
                    'description' => $req['description'] ?? null,
                    'answer_type' => $req['answer_type'],
                    'validation_config' => $req['validation_config'] ?? null,
                    'sort_order' => $i,
                ]);
            }

            return $this->services->update($service, ['step_requirements_saved' => true]);
        });
    }

    public function submit(TravelService $service): TravelService
    {
        $this->assertEditable($service);

        $missing = [];
        if (! $service->step_basic_saved) $missing[] = 'basic';
        if (! $service->step_details_saved) $missing[] = 'details';
        if (! $service->step_gallery_saved) $missing[] = 'gallery';
        if (! $service->step_requirements_saved) $missing[] = 'requirements';
        if ($missing) {
            throw new UnprocessableEntityHttpException('Incomplete steps: ' . implode(', ', $missing));
        }

        return DB::transaction(function () use ($service) {
            $attempt = $service->attempt + 1;
            $updated = $this->services->update($service, [
                'status' => TravelServiceStatus::PENDING_REVIEW->value,
                'attempt' => $attempt,
                'submitted_at' => now(),
                'rejection_reason' => null,
            ]);

            $updated->history()->create([
                'uuid' => (string) Str::uuid(),
                'attempt' => $attempt,
                'action' => 'submitted',
            ]);

            return $updated->fresh();
        });
    }

    private function storeImage(TravelService $service, UploadedFile $file): string
    {
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        return $file->storeAs("service-images/{$service->uuid}", $filename, 'private');
    }
}
