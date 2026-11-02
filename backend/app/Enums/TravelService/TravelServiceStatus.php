<?php
// app/Enums/TravelService/TravelServiceStatus.php

namespace App\Enums\TravelService;

enum TravelServiceStatus: string
{
    case DRAFT = 'DRAFT';
    case PENDING_REVIEW = 'PENDING_REVIEW';
    case UNDER_REVIEW = 'UNDER_REVIEW';
    case REJECTED = 'REJECTED';
    case PUBLISHED = 'PUBLISHED';
    case UNPUBLISHED = 'UNPUBLISHED';
    case SUSPENDED = 'SUSPENDED';

  public function isEditable(): bool
{
    return in_array($this, [
        self::DRAFT,
        self::REJECTED,
        self::PUBLISHED,
        self::UNPUBLISHED,
    ], true);
}

    public function isAgentVisible(): bool
    {
        // suspended is hidden from agent UI entirely
        return $this !== self::SUSPENDED;
    }

    public function isPublic(): bool
    {
        return $this === self::PUBLISHED;
    }
}