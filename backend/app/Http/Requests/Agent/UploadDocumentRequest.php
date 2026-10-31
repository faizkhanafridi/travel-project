<?php

namespace App\Http\Requests\Agent;

use App\Enums\Agent\DocumentType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UploadDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        $max = (int) config('agent.document_max_kb', 10240);
        $mimes = implode(',', config('agent.allowed_mimes', ['pdf', 'jpg', 'jpeg', 'png', 'webp']));

        return [
            'type' => ['required', 'string', Rule::in(array_map(fn ($t) => $t->value, DocumentType::cases()))],
            // 'mimes' + 'mimetypes' both set — belt and braces against spoofed extensions.
            'file' => [
                'required',
                'file',
                "max:{$max}",
                "mimes:{$mimes}",
                'mimetypes:application/pdf,image/jpeg,image/png,image/webp',
            ],
        ];
    }
}