<?php
// app/Models/TravelPost/TravelOffer.php

namespace App\Models\TravelPost;

use App\Enums\TravelPost\OfferStatus;
use App\Models\Agent\Agent;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TravelOffer extends Model
{
    use HasUuids;

    protected $fillable = [
        'uuid', 'travel_post_id', 'agent_id', 'amount', 'currency',
        'duration', 'duration_unit', 'message', 'inclusions', 'itinerary',
        'connects_spent', 'status', 'decided_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => OfferStatus::class,
            'amount' => 'decimal:2',
            'inclusions' => 'array',
            'decided_at' => 'datetime',
        ];
    }

    public function uniqueIds(): array { return ['uuid']; }
    public function getRouteKeyName(): string { return 'uuid'; }

    public function post(): BelongsTo { return $this->belongsTo(TravelPost::class, 'travel_post_id'); }
    public function agent(): BelongsTo { return $this->belongsTo(Agent::class); }
    public function requirements(): HasMany { return $this->hasMany(TravelOfferRequirement::class)->orderBy('sort_order'); }
}