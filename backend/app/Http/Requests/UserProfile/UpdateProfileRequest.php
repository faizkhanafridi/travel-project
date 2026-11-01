<?php
// app/Http/Requests/UserProfile/UpdateProfileRequest.php

namespace App\Http\Requests\UserProfile;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
                        'name' => ['sometimes', 'string', 'min:2', 'max:100'],

            'username' => [
                'sometimes', 'string', 'min:3', 'max:30', 'regex:/^[a-zA-Z0-9_\.]+$/',
                Rule::unique('users', 'username')->ignore($this->user()->id),
            ],
            // 'display_name' => ['sometimes', 'string', 'min:2', 'max:60'],
            'bio' => ['sometimes', 'nullable', 'string', 'min:20', 'max:1000'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:30', 'regex:/^\+?[0-9\s\-\(\)]+$/'],
            'date_of_birth' => ['sometimes', 'nullable', 'date', 'before:today'],
            'address_line' => ['sometimes', 'nullable', 'string', 'max:255'],
            'city' => ['sometimes', 'nullable', 'string', 'max:120'],
            'country' => ['sometimes', 'nullable', 'string', 'max:120'],
            'languages' => ['sometimes', 'nullable', 'array', 'max:20'],
            'languages.*' => ['string', 'max:60'],
            'photo' => ['sometimes', 'file', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'remove_photo' => ['sometimes', 'boolean'],
        ];
    }
}