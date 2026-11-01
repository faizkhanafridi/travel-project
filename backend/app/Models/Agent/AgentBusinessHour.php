<?php
// app/Models/Agent/AgentBusinessHour.php

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

    protected function casts(): array
    {
        return [
            'is_closed' => 'boolean',
        ];
    }

    public function agent(): BelongsTo
    {
        return $this->belongsTo(Agent::class);
    }
}