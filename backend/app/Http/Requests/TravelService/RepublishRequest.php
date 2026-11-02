<?php
// app/Http/Requests/TravelService/RepublishRequest.php

namespace App\Http\Requests\TravelService;

use Illuminate\Foundation\Http\FormRequest;

class RepublishRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'reason' => ['required', 'string', 'min:10', 'max:2000'],
        ];
    }
}