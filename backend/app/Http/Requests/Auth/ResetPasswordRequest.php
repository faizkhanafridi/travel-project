<?php
// app/Http/Requests/Auth/ResetPasswordRequest.php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class ResetPasswordRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email:rfc'],
            'code' => ['required', 'string', 'size:6', 'regex:/^\d{6}$/'],
            'password' => [
                'required', 'confirmed',
                Password::min(8)->letters()->mixedCase()->numbers()->symbols(),
            ],
        ];
    }
}