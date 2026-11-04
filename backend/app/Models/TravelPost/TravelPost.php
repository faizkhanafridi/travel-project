<?php
// app/Models/TravelPost/TravelPost.php

namespace App\Models\TravelPost;

use App\Enums\TravelPost\TravelPostStatus;
use App\Enums\TravelPost\TravelPostType;
use App\Models\Agent\Agent;
use App\Models\Auth\User;
use App\Models\TravelService\ServiceCategory;
use App\Models\TravelService\TravelService;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TravelPost extends Model
{
    use HasUuids;

    protected $fillable = [
        'uuid', 'customer_id', 'type', 'status', 'travel_service_id', 'agent_id',
        'title', 'description', 'category_id', 'subcategory_id', 'milestone_model',
        'duration', 'duration_unit', 'destination_country', 'destination_city',
        'travel_date', 'preferred_date', 'travelers_total', 'travelers_adults', 'travelers_children',
        'budget_min', 'budget_max', 'currency', 'services_needed', 'additional_requirements',
        'expires_at', 'offers_close_at', 'accepted_offer_id',
    ];

    protected function casts(): array
    {
        return [
            'type' => TravelPostType::class,
            'status' => TravelPostStatus::class,
            'services_needed' => 'array',
            'travel_date' => 'date',
            'preferred_date' => 'date',
            'budget_min' => 'decimal:2',
            'budget_max' => 'decimal:2',
            'expires_at' => 'datetime',
            'offers_close_at' => 'datetime',
        ];
    }

    public function uniqueIds(): array { return ['uuid']; }
    public function getRouteKeyName(): string { return 'uuid'; }

    public function customer(): BelongsTo { return $this->belongsTo(User::class, 'customer_id'); }
    public function agent(): BelongsTo { return $this->belongsTo(Agent::class); }
    public function service(): BelongsTo { return $this->belongsTo(TravelService::class, 'travel_service_id'); }
    public function category(): BelongsTo { return $this->belongsTo(ServiceCategory::class, 'category_id'); }
    public function subcategory(): BelongsTo { return $this->belongsTo(ServiceCategory::class, 'subcategory_id'); }
    public function offers(): HasMany { return $this->hasMany(TravelOffer::class); }
    public function acceptedOffer(): BelongsTo { return $this->belongsTo(TravelOffer::class, 'accepted_offer_id'); }

    public function isOpen(): bool
    {
        return $this->status === TravelPostStatus::OPEN;
    }
}