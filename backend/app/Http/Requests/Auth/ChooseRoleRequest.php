<?php
// app/Http/Requests/Auth/ChooseRoleRequest.php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ChooseRoleRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'choice' => ['required', Rule::in(['customer', 'agent'])],
        ];
    }
}