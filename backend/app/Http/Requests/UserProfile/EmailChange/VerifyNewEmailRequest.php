<?php
// app/Http/Requests/UserProfile/EmailChange/VerifyNewEmailRequest.php

namespace App\Http\Requests\UserProfile\EmailChange;

use Illuminate\Foundation\Http\FormRequest;

class VerifyNewEmailRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return ['code' => ['required', 'string', 'size:6', 'regex:/^\d{6}$/']];
    }
}