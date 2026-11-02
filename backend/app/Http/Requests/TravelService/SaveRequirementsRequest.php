<?php
// app/Http/Requests/TravelService/SaveRequirementsRequest.php

namespace App\Http\Requests\TravelService;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SaveRequirementsRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'requirements' => ['required', 'array', 'min:1', 'max:20'],
            'requirements.*.title' => ['required', 'string', 'max:200'],
            'requirements.*.description' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'requirements.*.answer_type' => ['required', Rule::in(['text', 'textarea', 'file', 'number', 'date'])],
            'requirements.*.validation_config' => ['sometimes', 'nullable', 'array'],
        ];
    }
}