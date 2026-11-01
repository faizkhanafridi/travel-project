<?php
// app/Http/Requests/Agent/Admin/RejectAgentRequest.php

namespace App\Http\Requests\Agent\Admin;

use Illuminate\Foundation\Http\FormRequest;

class RejectAgentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('super_admin') ?? false;
    }

    public function rules(): array
    {
        return [
            'reason' => ['required', 'string', 'min:5', 'max:2000'],
        ];
    }
}