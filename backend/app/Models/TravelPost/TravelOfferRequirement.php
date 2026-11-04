<?php
// app/Models/TravelPost/TravelOfferRequirement.php

namespace App\Models\TravelPost;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TravelOfferRequirement extends Model
{
    use HasUuids;

    protected $fillable = [
        'uuid', 'travel_offer_id', 'title', 'description', 'answer_type',
        'validation_config', 'sort_order',
    ];

    protected function casts(): array
    {
        return ['validation_config' => 'array'];
    }

    public function uniqueIds(): array { return ['uuid']; }

    public function offer(): BelongsTo { return $this->belongsTo(TravelOffer::class, 'travel_offer_id'); }
}