<?php

namespace App\Enums\Agent;

enum AgentStatus: string
{
    case DRAFT = 'draft';
    case PENDING_REVIEW = 'pending_review';
    case UNDER_REVIEW = 'under_review';
    case REJECTED = 'rejected';
    case APPROVED = 'approved';
    case SUSPENDED = 'suspended';
}