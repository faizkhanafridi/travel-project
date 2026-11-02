<?php
// app/Http/Requests/TravelService/Admin/RejectRepublishRequest.php

namespace App\Http\Requests\TravelService\Admin;

use Illuminate\Foundation\Http\FormRequest;

class RejectRepublishRequest extends FormRequest
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