<?php
// app/Http/Requests/Messaging/StartConversationRequest.php

namespace App\Http\Requests\Messaging;

use Illuminate\Foundation\Http\FormRequest;

class StartConversationRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'agent_uuid' => ['required', 'string', 'uuid'],
            'service_uuid' => ['sometimes', 'nullable', 'string', 'uuid'],
        ];
    }
}