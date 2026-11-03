<?php
// app/Http/Requests/Messaging/SendMessageRequest.php

namespace App\Http\Requests\Messaging;

use Illuminate\Foundation\Http\FormRequest;

class SendMessageRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'body' => ['required', 'string', 'min:1', 'max:4000'],
            'meta' => ['sometimes', 'nullable', 'array'],
        ];
    }
}