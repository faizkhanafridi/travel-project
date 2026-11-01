<?php
// app/Enums/Agent/AgentStatus.php

namespace App\Enums\Agent;

enum AgentStatus: string
{
    case DRAFT = 'DRAFT';
    case PENDING_REVIEW = 'PENDING_REVIEW';
    case UNDER_REVIEW = 'UNDER_REVIEW';
    case APPROVED = 'APPROVED';
    case REJECTED = 'REJECTED';
    case SUSPENDED = 'SUSPENDED';

    public function isEditable(): bool
    {
        return in_array($this, [self::DRAFT, self::REJECTED], true);
    }

    public function isWizardEditable(): bool
{
    return in_array($this, [self::DRAFT, self::REJECTED, self::APPROVED], true);
}
}