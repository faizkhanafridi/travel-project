<?php
// app/Models/Agent/AgentProfile.php

namespace App\Models\Agent;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AgentProfile extends Model
{
    use HasUuids;

    protected $fillable = [
        'uuid',
        'agent_id',
        'agency_name',
        'agency_owner_name',
        'agency_phone',
        'agency_country',
        'agency_city',
        'agency_address',
        'business_description',
        'years_in_business',
        'business_type',
        'registration_number',
        'website',
        'social_media',
        'languages',
        'specializations',
    ];

    protected function casts(): array
    {
        return [
            'social_media' => 'array',
            'languages' => 'array',
            'specializations' => 'array',
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