<?php
// app/Http/Requests/TravelPost/CreateGlobalPostRequest.php

namespace App\Http\Requests\TravelPost;

use Illuminate\Foundation\Http\FormRequest;

class CreateGlobalPostRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'min:5', 'max:150'],
            'description' => ['required', 'string', 'min:300', 'max:1200'],
            'category_id' => ['required', 'integer', 'exists:service_categories,id'],
            'subcategory_id' => ['required', 'integer', 'exists:service_categories,id'],
            'duration' => ['required', 'integer', 'min:1', 'max:365'],
            'duration_unit' => ['required', 'string', 'max:20'],
            'destination_country' => ['required', 'string', 'max:80'],
            'destination_city' => ['required', 'string', 'max:80'],
            'travel_date' => ['sometimes', 'nullable', 'date', 'after_or_equal:today'],
            'travelers_total' => ['required', 'integer', 'min:1', 'max:50'],
            'travelers_adults' => ['required', 'integer', 'min:1', 'max:50'],
            'travelers_children' => ['sometimes', 'integer', 'min:0', 'max:50'],
            'budget_min' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'budget_max' => ['sometimes', 'nullable', 'numeric', 'min:0', 'gte:budget_min'],
            'services_needed' => ['sometimes', 'array', 'max:20'],
            'services_needed.*' => ['string', 'max:120'],
            'additional_requirements' => ['sometimes', 'nullable', 'string', 'max:2000'],
        ];
    }
}