<?php

namespace App\Http\Resources\Agent;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AgentProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'agency_name' => $this->agency_name,
            'agency_owner_name' => $this->agency_owner_name,
            'phone' => $this->phone,
            'country' => $this->country,
            'city' => $this->city,
            'address' => $this->address,
            'agency_information_completed' => (bool) $this->agency_information_completed,
            'business_description' => $this->business_description,
            'years_in_business' => $this->years_in_business,
            'business_type' => $this->business_type,
            'registration_information' => $this->registration_information,
            'website' => $this->website,
            'social_media' => $this->social_media ?? [],
            'languages' => $this->languages ?? [],
            'specializations' => $this->specializations ?? [],
            'business_information_completed' => (bool) $this->business_information_completed,
        ];
    }
}