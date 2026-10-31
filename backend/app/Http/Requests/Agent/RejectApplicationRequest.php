<?php

namespace App\Http\Requests\Agent;

use Illuminate\Foundation\Http\FormRequest;

class RejectApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null && $this->user()->hasRole('super_admin');
    }

    public function rules(): array
    {
        return [
            'rejection_reason' => ['required', 'string', 'min:5', 'max:1000'],
        ];
    }
}