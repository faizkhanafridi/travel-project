<?php
// app/Models/TravelPost/ConnectTransaction.php

namespace App\Models\TravelPost;

use App\Models\Agent\Agent;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConnectTransaction extends Model
{
    use HasUuids;

    protected $fillable = [
        'uuid', 'agent_id', 'type', 'amount', 'balance_after',
        'reference_type', 'reference_id', 'note',
    ];

    public function uniqueIds(): array { return ['uuid']; }

    public function agent(): BelongsTo { return $this->belongsTo(Agent::class); }
}