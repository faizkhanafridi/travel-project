<?php
// app/Http/Requests/TravelService/SaveDetailsRequest.php

namespace App\Http\Requests\TravelService;

use Illuminate\Foundation\Http\FormRequest;

class SaveDetailsRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'short_description' => ['nullable', 'string', 'max:500'],
            'full_description' => ['required', 'string', 'min:600', 'max:2000'],
            'price' => ['required', 'numeric', 'min:1', 'max:9999999'],
            'destination_country' => ['required', 'string', 'max:80'],
            'destination_city' => ['required', 'string', 'max:80'],
            'duration' => ['required', 'integer', 'min:1', 'max:3650'],
            'duration_unit' => ['required', 'string', 'max:20'],
            'inclusions' => ['required', 'array', 'min:1', 'max:30'],
            'inclusions.*' => ['string', 'min:2', 'max:200'],
            'extras' => ['sometimes', 'nullable', 'array', 'max:20'],
            'extras.*.label' => ['required_with:extras', 'string', 'max:200'],
            'extras.*.price' => ['required_with:extras', 'numeric', 'min:0'],
            'extras.*.description' => ['sometimes', 'nullable', 'string', 'max:500'],
            'cancellation_policy' => ['sometimes', 'nullable', 'string', 'max:2000'],
        ];
    }
}