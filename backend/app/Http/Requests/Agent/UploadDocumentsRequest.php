<?php
// app/Http/Requests/Agent/UploadDocumentsRequest.php

namespace App\Http\Requests\Agent;

use Illuminate\Foundation\Http\FormRequest;

class UploadDocumentsRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'business_registration' => ['sometimes', 'file', 'mimes:pdf,jpg,jpeg,png,webp', 'max:10240'],
            'license' => ['sometimes', 'file', 'mimes:pdf,jpg,jpeg,png,webp', 'max:10240'],
            'identity' => ['sometimes', 'file', 'mimes:pdf,jpg,jpeg,png,webp', 'max:10240'],
            'other.*' => ['sometimes', 'file', 'mimes:pdf,jpg,jpeg,png,webp', 'max:10240'],
        ];
    }
}