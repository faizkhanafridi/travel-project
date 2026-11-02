<?php
// app/Models/TravelService/TravelServiceExtra.php

namespace App\Models\TravelService;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TravelServiceExtra extends Model
{
    use HasUuids;

    protected $fillable = ['uuid', 'travel_service_id', 'label', 'price', 'currency', 'description', 'sort_order'];
    protected function casts(): array { return ['price' => 'decimal:2']; }
    public function uniqueIds(): array { return ['uuid']; }
    public function service(): BelongsTo { return $this->belongsTo(TravelService::class, 'travel_service_id'); }
}