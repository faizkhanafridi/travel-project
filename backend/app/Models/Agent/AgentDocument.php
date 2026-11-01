<?php
// app/Models/Agent/AgentDocument.php

namespace App\Models\Agent;

use App\Enums\Agent\AgentDocumentType;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AgentDocument extends Model
{
    use HasUuids;

    protected $fillable = [
        'uuid',
        'agent_id',
        'type',
        'original_name',
        'file_path',
        'mime_type',
        'size_bytes',
        'locked_at',
    ];

    protected $hidden = ['file_path'];

    protected function casts(): array
    {
        return [
            'type' => AgentDocumentType::class,
            'locked_at' => 'datetime',
        ];
    }

    public function uniqueIds(): array
    {
        return ['uuid'];
    }

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    public function agent(): BelongsTo
    {
        return $this->belongsTo(Agent::class);
    }
}