<?php
// app/Http/Requests/Agent/SaveBusinessRequest.php

namespace App\Http\Requests\Agent;

use Illuminate\Foundation\Http\FormRequest;

class SaveBusinessRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'business_description' => ['required', 'string', 'min:50', 'max:5000'],
            'years_in_business' => ['required', 'integer', 'min:0', 'max:200'],
            'business_type' => ['required', 'string', 'max:120'],
            'registration_number' => ['sometimes', 'nullable', 'string', 'max:120'],
            'website' => ['sometimes', 'nullable', 'url', 'max:255'],
            'social_media' => ['sometimes', 'nullable', 'array'],
            'social_media.*' => ['string', 'max:255'],
            'languages' => ['sometimes', 'nullable', 'array', 'max:20'],
            'languages.*' => ['string', 'max:60'],
            'specializations' => ['sometimes', 'nullable', 'array', 'max:20'],
            'specializations.*' => ['string', 'max:120'],
        ];
    }
}