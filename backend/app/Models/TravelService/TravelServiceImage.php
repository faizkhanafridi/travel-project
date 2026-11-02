<?php
// app/Models/TravelService/TravelServiceImage.php

namespace App\Models\TravelService;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TravelServiceImage extends Model
{
    use HasUuids;

    protected $fillable = ['uuid', 'travel_service_id', 'file_path', 'mime_type', 'size_bytes', 'is_cover', 'sort_order'];
    protected $hidden = ['file_path'];
    protected function casts(): array { return ['is_cover' => 'boolean']; }
    public function uniqueIds(): array { return ['uuid']; }
    public function service(): BelongsTo { return $this->belongsTo(TravelService::class, 'travel_service_id'); }
}