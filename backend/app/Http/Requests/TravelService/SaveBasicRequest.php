<?php
// app/Http/Requests/TravelService/SaveBasicRequest.php

namespace App\Http\Requests\TravelService;

use Illuminate\Foundation\Http\FormRequest;

class SaveBasicRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'min:5', 'max:150'],
            'category_id' => ['required', 'integer', 'exists:service_categories,id'],
            'subcategory_id' => ['required', 'integer', 'exists:service_categories,id'],
            'tags' => ['required', 'array', 'min:3', 'max:20'],
            'tags.*' => ['string', 'min:2', 'max:60'],
        ];
    }
}