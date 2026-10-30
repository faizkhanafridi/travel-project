<?php

namespace App\Http\Requests\UserProfile;

use Illuminate\Foundation\Http\FormRequest;

class InitiateEmailChangeWithPasswordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'new_email' => ['required', 'string', 'email', 'max:255'],
            'current_password' => ['required', 'string'],
        ];
    }
}