<?php
// app/Models/Agent/AgentSubmissionHistory.php

namespace App\Models\Agent;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AgentSubmissionHistory extends Model
{
    use HasUuids;

    protected $table = 'agent_submission_history';

    protected $fillable = [
        'uuid',
        'agent_id',
        'attempt',
        'action',
        'reason',
        'admin_id',
        'snapshot',
    ];

    protected function casts(): array
    {
        return ['snapshot' => 'array'];
    }

    public function uniqueIds(): array
    {
        return ['uuid'];
    }

    public function agent(): BelongsTo
    {
        return $this->belongsTo(Agent::class);
    }
}