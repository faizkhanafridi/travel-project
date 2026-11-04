<?php
// app/Http/Requests/TravelPost/OfferDecisionRequest.php

namespace App\Http\Requests\TravelPost;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class OfferDecisionRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'decision' => ['required', Rule::in(['accept', 'reject', 'shortlist'])],
        ];
    }
}