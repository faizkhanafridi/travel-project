<?php
// app/Models/TravelService/TravelService.php

namespace App\Models\TravelService;

use App\Enums\TravelService\TravelServiceStatus;
use App\Models\Agent\Agent;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class TravelService extends Model
{
    use HasUuids, SoftDeletes;

    protected $fillable = [
        'uuid', 'agent_id', 'category_id', 'subcategory_id', 'title', 'slug',
        'short_description', 'full_description', 'price', 'currency',
        'destination_country', 'destination_city', 'duration', 'duration_unit',
        'cancellation_policy', 'status', 'attempt', 'submitted_at', 'published_at',
        'reviewed_at', 'reviewed_by', 'rejection_reason', 'suspended_at',
        'step_basic_saved', 'step_details_saved', 'step_gallery_saved', 'step_requirements_saved',
    ];

    protected function casts(): array
    {
        return [
            'status' => TravelServiceStatus::class,
            'price' => 'decimal:2',
            'submitted_at' => 'datetime',
            'published_at' => 'datetime',
            'reviewed_at' => 'datetime',
            'suspended_at' => 'datetime',
            'step_basic_saved' => 'boolean',
            'step_details_saved' => 'boolean',
            'step_gallery_saved' => 'boolean',
            'step_requirements_saved' => 'boolean',
        ];
    }

    public function uniqueIds(): array { return ['uuid']; }
    public function getRouteKeyName(): string { return 'uuid'; }

    public function agent(): BelongsTo { return $this->belongsTo(Agent::class); }
    public function category(): BelongsTo { return $this->belongsTo(ServiceCategory::class, 'category_id'); }
    public function subcategory(): BelongsTo { return $this->belongsTo(ServiceCategory::class, 'subcategory_id'); }
    public function tags(): HasMany { return $this->hasMany(TravelServiceTag::class); }
    public function inclusions(): HasMany { return $this->hasMany(TravelServiceInclusion::class); }
    public function extras(): HasMany { return $this->hasMany(TravelServiceExtra::class); }
    public function images(): HasMany { return $this->hasMany(TravelServiceImage::class)->orderBy('sort_order'); }
    public function requirements(): HasMany { return $this->hasMany(TravelServiceRequirement::class)->orderBy('sort_order'); }
    public function history(): HasMany { return $this->hasMany(TravelServiceSubmissionHistory::class); }
    public function republishRequests(): HasMany { return $this->hasMany(ServiceRepublishRequest::class); }

    public function coverImage(): ?TravelServiceImage
    {
        return $this->images->firstWhere('is_cover', true) ?? $this->images->first();
    }
}