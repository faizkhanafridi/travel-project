<?php
// app/Enums/Agent/AgentDocumentType.php

namespace App\Enums\Agent;

enum AgentDocumentType: string
{
    case BUSINESS_REGISTRATION = 'business_registration';
    case LICENSE = 'license';
    case IDENTITY = 'identity';
    case OTHER = 'other';
}