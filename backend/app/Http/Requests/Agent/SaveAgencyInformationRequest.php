<?php

namespace App\Http\Requests\Agent;

use Illuminate\Foundation\Http\FormRequest;

class SaveAgencyInformationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'agency_name' => ['required', 'string', 'min:2', 'max:150'],
            'agency_owner_name' => ['required', 'string', 'min:2', 'max:150'],
            'phone' => ['nullable', 'string', 'max:30', 'regex:/^\+?[0-9\s\-()]{6,30}$/'],
            'country' => ['required', 'string', 'max:80'],
            'city' => ['required', 'string', 'max:120'],
            'address' => ['required', 'string', 'max:500'],
        ];
    }
}