<?php
// app/Http/Resources/Agent/Admin/AgentAdminDetailResource.php

namespace App\Http\Resources\Agent\Admin;

use App\Http\Resources\Agent\AgentBusinessHourResource;
use App\Http\Resources\Agent\AgentDocumentResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AgentAdminDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $profile = $this->profile;

        return [
            'uuid' => $this->uuid,
            'status' => $this->status?->value,
            'attempt' => $this->attempt,
            'submitted_at' => $this->submitted_at?->toIso8601String(),
            'reviewed_at' => $this->reviewed_at?->toIso8601String(),
            'rejection_reason' => $this->rejection_reason,
            'approved_at' => $this->approved_at?->toIso8601String(),
            'user' => [
                'uuid' => $this->user?->uuid,
                'name' => $this->user?->name,
                'username' => $this->user?->username,
                'email' => $this->user?->email,
            ],
            'agency' => $profile ? [
                'agency_name' => $profile->agency_name,
                'agency_owner_name' => $profile->agency_owner_name,
                'agency_phone' => $profile->agency_phone,
                'agency_country' => $profile->agency_country,
                'agency_city' => $profile->agency_city,
                'agency_address' => $profile->agency_address,
            ] : null,
            'business' => $profile ? [
                'business_description' => $profile->business_description,
                'years_in_business' => $profile->years_in_business,
                'business_type' => $profile->business_type,
                'registration_number' => $profile->registration_number,
                'website' => $profile->website,
                'social_media' => $profile->social_media ?? [],
                'languages' => $profile->languages ?? [],
                'specializations' => $profile->specializations ?? [],
            ] : null,
            'documents' => AgentDocumentResource::collection($this->whenLoaded('documents')),
            'business_hours' => AgentBusinessHourResource::collection($this->whenLoaded('businessHours')),
            'history' => $this->whenLoaded('submissionHistory', fn () => $this->submissionHistory->map(fn ($h) => [
                'attempt' => $h->attempt,
                'action' => $h->action,
                'reason' => $h->reason,
                'created_at' => $h->created_at?->toIso8601String(),
            ])->all()),
        ];
    }
}