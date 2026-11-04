<?php
// app/Http/Requests/TravelPost/SubmitOfferRequest.php

namespace app\Http\Requests\TravelPost;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SubmitOfferRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'amount' => ['required', 'numeric', 'min:1'],
            'duration' => ['required', 'integer', 'min:1', 'max:365'],
            'duration_unit' => ['required', 'string', 'max:20'],
            'message' => ['required', 'string', 'min:20', 'max:2000'],
            'inclusions' => ['sometimes', 'array', 'max:20'],
            'inclusions.*' => ['string', 'max:200'],
            'itinerary' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'requirements' => ['required', 'array', 'min:2', 'max:20'],
            'requirements.*.title' => ['required', 'string', 'max:200'],
            'requirements.*.description' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'requirements.*.answer_type' => ['required', Rule::in(['text', 'textarea', 'file', 'number', 'date'])],
            'requirements.*.validation_config' => ['sometimes', 'nullable', 'array'],
        ];
    }
}