<?php
// app/Models/TravelService/TravelServiceRequirement.php

namespace App\Models\TravelService;

use App\Enums\TravelService\RequirementAnswerType;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TravelServiceRequirement extends Model
{
    use HasUuids;

    protected $fillable = ['uuid', 'travel_service_id', 'title', 'description', 'answer_type', 'validation_config', 'sort_order'];
    protected function casts(): array
    {
        return ['answer_type' => RequirementAnswerType::class, 'validation_config' => 'array'];
    }
    public function uniqueIds(): array { return ['uuid']; }
    public function service(): BelongsTo { return $this->belongsTo(TravelService::class, 'travel_service_id'); }
}