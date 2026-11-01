<?php
// app/Http/Requests/Agent/SaveHoursRequest.php

namespace App\Http\Requests\Agent;

use Illuminate\Foundation\Http\FormRequest;

class SaveHoursRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'hours' => ['required', 'array', 'min:1', 'max:7'],
            'hours.*.day_of_week' => ['required', 'integer', 'min:0', 'max:6'],
            'hours.*.is_closed' => ['sometimes', 'boolean'],
            'hours.*.open_time' => ['required_if:hours.*.is_closed,false', 'nullable', 'date_format:H:i'],
            'hours.*.close_time' => ['required_if:hours.*.is_closed,false', 'nullable', 'date_format:H:i', 'after:hours.*.open_time'],
        ];
    }
}