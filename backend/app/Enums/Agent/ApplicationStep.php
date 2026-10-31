<?php

namespace App\Enums\Agent;

enum ApplicationStep: string
{
    case AGENCY_INFORMATION = 'agency_information';
    case BUSINESS_INFORMATION = 'business_information';
    case DOCUMENTS = 'documents';
    case BUSINESS_HOURS = 'business_hours';
    case REVIEW = 'review';
}