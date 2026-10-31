<?php

namespace App\Http\Requests\Agent;

use Illuminate\Foundation\Http\FormRequest;

class SaveBusinessHoursRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'hours' => ['required', 'array', 'size:7'],
            'hours.*.day_of_week' => ['required', 'integer', 'between:0,6'],
            'hours.*.is_closed' => ['required', 'boolean'],
            'hours.*.open_time' => ['nullable', 'date_format:H:i'],
            'hours.*.close_time' => ['nullable', 'date_format:H:i'],
        ];
    }
}