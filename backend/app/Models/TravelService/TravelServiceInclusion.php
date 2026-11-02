<?php
// app/Models/TravelService/TravelServiceInclusion.php

namespace App\Models\TravelService;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TravelServiceInclusion extends Model
{
    protected $fillable = ['travel_service_id', 'label', 'sort_order'];
    public function service(): BelongsTo { return $this->belongsTo(TravelService::class, 'travel_service_id'); }
}