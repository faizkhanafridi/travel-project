<?php

namespace App\Enums\Agent;

enum DocumentType: string
{
    case BUSINESS_REGISTRATION = 'business_registration';
    case LICENSE = 'license';
    case IDENTITY = 'identity';
    case OTHER = 'other';

    public static function required(): array
    {
        return [self::BUSINESS_REGISTRATION, self::LICENSE, self::IDENTITY];
    }
}