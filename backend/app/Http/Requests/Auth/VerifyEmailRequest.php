<?php
// app/Http/Requests/Auth/VerifyEmailRequest.php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class VerifyEmailRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email:rfc'],
            'code' => ['required', 'string', 'size:6', 'regex:/^\d{6}$/'],
        ];
    }
}