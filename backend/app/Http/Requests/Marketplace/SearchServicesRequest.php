<?php
// app/Http/Requests/Marketplace/SearchServicesRequest.php

namespace App\Http\Requests\Marketplace;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SearchServicesRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'q' => ['sometimes', 'nullable', 'string', 'max:150'],
            'category_id' => ['sometimes', 'nullable', 'integer', 'exists:service_categories,id'],
            'subcategory_id' => ['sometimes', 'nullable', 'integer', 'exists:service_categories,id'],
            'destination_country' => ['sometimes', 'nullable', 'string', 'max:80'],
            'destination_city' => ['sometimes', 'nullable', 'string', 'max:80'],
            'price_min' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'price_max' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'duration_min' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'duration_max' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'duration_unit' => ['sometimes', 'nullable', 'string', 'max:20'],
            'sort' => ['sometimes', 'string', Rule::in(['recommended', 'newest', 'lowest_price', 'highest_price'])],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:60'],
        ];
    }
}