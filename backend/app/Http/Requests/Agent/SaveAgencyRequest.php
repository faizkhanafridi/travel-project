<?php
// app/Http/Requests/Agent/SaveAgencyRequest.php

namespace App\Http\Requests\Agent;

use Illuminate\Foundation\Http\FormRequest;

class SaveAgencyRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'agency_name' => ['required', 'string', 'min:2', 'max:120'],
            'agency_owner_name' => ['required', 'string', 'min:2', 'max:120'],
            'agency_phone' => ['sometimes', 'nullable', 'string', 'max:30', 'regex:/^\+?[0-9\s\-\(\)]+$/'],
            'agency_country' => ['required', 'string', 'max:80'],
            'agency_city' => ['required', 'string', 'max:80'],
            'agency_address' => ['required', 'string', 'max:255'],
        ];
    }
}