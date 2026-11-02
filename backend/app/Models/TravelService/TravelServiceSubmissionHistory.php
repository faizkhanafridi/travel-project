<?php
// app/Models/TravelService/TravelServiceSubmissionHistory.php

namespace App\Models\TravelService;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TravelServiceSubmissionHistory extends Model
{
    use HasUuids;

    protected $table = 'travel_service_submission_history';
    protected $fillable = ['uuid', 'travel_service_id', 'attempt', 'action', 'reason', 'admin_id', 'snapshot'];
    protected function casts(): array { return ['snapshot' => 'array']; }
    public function uniqueIds(): array { return ['uuid']; }
    public function service(): BelongsTo { return $this->belongsTo(TravelService::class, 'travel_service_id'); }
}