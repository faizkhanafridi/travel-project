<?php
// app/Http/Requests/TravelPost/CreateServiceTripRequest.php

namespace App\Http\Requests\TravelPost;

use Illuminate\Foundation\Http\FormRequest;

class CreateServiceTripRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'description' => ['required', 'string', 'min:300', 'max:1200'],
            'preferred_date' => ['required', 'date', 'after_or_equal:today'],
            'duration' => ['required', 'integer', 'min:1', 'max:365'],
            'duration_unit' => ['required', 'string', 'max:20'],
            'travelers_total' => ['required', 'integer', 'min:1', 'max:50'],
            'travelers_adults' => ['required', 'integer', 'min:1', 'max:50'],
            'travelers_children' => ['sometimes', 'integer', 'min:0', 'max:50'],
            'budget_min' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'budget_max' => ['sometimes', 'nullable', 'numeric', 'min:0', 'gte:budget_min'],
            'additional_requirements' => ['sometimes', 'nullable', 'string', 'max:2000'],
        ];
    }
}