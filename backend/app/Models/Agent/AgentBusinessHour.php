<?php

namespace App\Models\Agent;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AgentBusinessHour extends Model
{
    protected $fillable = [
        'agent_id',
        'day_of_week',
        'is_closed',
        'open_time',
        'close_time',
    ];

    protected $casts = [
        'is_closed' => 'boolean',
        'day_of_week' => 'integer',
    ];

    public function agent(): BelongsTo
    {
        return $this->belongsTo(Agent::class);
    }
}