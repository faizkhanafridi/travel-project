<?php

namespace App\Models\Agent;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AgentProfile extends Model
{
    protected $fillable = [
        'agent_id',
        'agency_name',
        'agency_owner_name',
        'phone',
        'country',
        'city',
        'address',
        'agency_information_completed',
        'business_description',
        'years_in_business',
        'business_type',
        'registration_information',
        'website',
        'social_media',
        'languages',
        'specializations',
        'business_information_completed',
    ];

    protected $casts = [
        'social_media' => 'array',
        'languages' => 'array',
        'specializations' => 'array',
        'agency_information_completed' => 'boolean',
        'business_information_completed' => 'boolean',
        'years_in_business' => 'integer',
    ];

    public function agent(): BelongsTo
    {
        return $this->belongsTo(Agent::class);
    }
}