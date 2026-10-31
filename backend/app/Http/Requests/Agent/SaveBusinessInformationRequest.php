<?php

namespace App\Http\Requests\Agent;

use Illuminate\Foundation\Http\FormRequest;

class SaveBusinessInformationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'business_description' => ['required', 'string', 'min:50', 'max:2000'],
            'years_in_business' => ['required', 'integer', 'min:0', 'max:100'],
            'business_type' => ['required', 'string', 'max:80'],
            'registration_information' => ['nullable', 'string', 'max:500'],
            'website' => ['nullable', 'url', 'max:200'],
            'social_media' => ['nullable', 'array', 'max:10'],
            'social_media.*' => ['string', 'max:200'],
            'languages' => ['nullable', 'array', 'max:20'],
            'languages.*' => ['string', 'max:60'],
            'specializations' => ['nullable', 'array', 'max:20'],
            'specializations.*' => ['string', 'max:60'],
        ];
    }
}