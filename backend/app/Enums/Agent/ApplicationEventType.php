<?php

namespace App\Enums\Agent;

enum ApplicationEventType: string
{
    case SUBMITTED = 'submitted';
    case RESUBMITTED = 'resubmitted';
    case UNDER_REVIEW = 'under_review';
    case APPROVED = 'approved';
    case REJECTED = 'rejected';
    case SUSPENDED = 'suspended';
    case UNSUSPENDED = 'unsuspended';
}