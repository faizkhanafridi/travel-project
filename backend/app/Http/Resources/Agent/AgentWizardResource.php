<?php
// app/Http/Resources/Agent/AgentWizardResource.php

namespace App\Http\Resources\Agent;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AgentWizardResource extends JsonResource
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
            'steps' => [
                'agency' => (bool) $this->step_agency_saved,
                'business' => (bool) $this->step_business_saved,
                'documents' => (bool) $this->step_documents_saved,
                'hours' => (bool) $this->step_hours_saved,
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
            'connects_balance' => $this->connects_balance,
            'can_edit' => $this->status?->isEditable() ?? false,
            'can_submit' => $this->status?->isEditable()
                && $this->step_agency_saved
                && $this->step_business_saved
                && $this->step_documents_saved
                && $this->step_hours_saved,
        ];
    }
}