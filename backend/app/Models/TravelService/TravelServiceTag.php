<?php
// app/Models/TravelService/TravelServiceTag.php

namespace App\Models\TravelService;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TravelServiceTag extends Model
{
    protected $fillable = ['travel_service_id', 'tag'];
    public function service(): BelongsTo { return $this->belongsTo(TravelService::class, 'travel_service_id'); }
}