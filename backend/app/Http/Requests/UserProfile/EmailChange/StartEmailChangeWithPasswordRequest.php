<?php
// app/Http/Requests/UserProfile/EmailChange/StartEmailChangeWithPasswordRequest.php

namespace App\Http\Requests\UserProfile\EmailChange;

use Illuminate\Foundation\Http\FormRequest;

class StartEmailChangeWithPasswordRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'new_email' => ['required', 'string', 'email:rfc', 'max:255'],
            'current_password' => ['required', 'string'],
        ];
    }
}