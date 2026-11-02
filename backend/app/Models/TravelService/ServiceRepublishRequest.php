<?php
// app/Models/TravelService/ServiceRepublishRequest.php

namespace App\Models\TravelService;

use App\Enums\TravelService\RepublishRequestStatus;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceRepublishRequest extends Model
{
    use HasUuids;

    protected $fillable = ['uuid', 'travel_service_id', 'agent_id', 'status', 'reason', 'rejection_reason', 'reviewed_at', 'reviewed_by'];
    protected function casts(): array
    {
        return ['status' => RepublishRequestStatus::class, 'reviewed_at' => 'datetime'];
    }
    public function uniqueIds(): array { return ['uuid']; }
    public function service(): BelongsTo { return $this->belongsTo(TravelService::class, 'travel_service_id'); }
}