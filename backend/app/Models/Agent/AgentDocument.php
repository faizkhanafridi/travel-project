<?php

namespace App\Models\Agent;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class AgentDocument extends Model
{
    protected $fillable = [
        'uuid',
        'agent_id',
        'type',
        'original_name',
        'storage_path',
        'mime',
        'size',
        'is_approved',
    ];

    protected $hidden = ['storage_path'];

    protected $casts = [
        'is_approved' => 'boolean',
        'size' => 'integer',
    ];

    protected static function booted(): void
    {
        static::creating(function (self $doc) {
            $doc->uuid ??= (string) Str::uuid();
        });
    }

    public function agent(): BelongsTo
    {
        return $this->belongsTo(Agent::class);
    }
}