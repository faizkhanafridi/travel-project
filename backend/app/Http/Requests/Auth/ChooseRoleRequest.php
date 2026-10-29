<?php

namespace App\Http\Requests\Auth;

use App\Enums\Auth\AccountType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ChooseRoleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'account_type' => [
                'required',
                'string',
                Rule::in([
                    AccountType::CUSTOMER->value,
                    AccountType::AGENT->value,
                ]),
            ],
        ];
    }
}