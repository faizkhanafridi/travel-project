<?php
// app/Http/Requests/Auth/MfaVerifyRequest.php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class MfaVerifyRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return ['code' => ['required', 'string', 'size:6', 'regex:/^\d{6}$/']];
    }
}