<?php
// app/Http/Requests/TravelService/UpdateGalleryOrderRequest.php

namespace App\Http\Requests\TravelService;

use Illuminate\Foundation\Http\FormRequest;

class UpdateGalleryOrderRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'order' => ['required', 'array', 'min:1'],
            'order.*' => ['string', 'uuid'],
            'cover_uuid' => ['required', 'string', 'uuid'],
        ];
    }
}