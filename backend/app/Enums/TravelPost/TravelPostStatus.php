<?php
// app/Enums/TravelPost/TravelPostStatus.php

namespace App\Enums\TravelPost;

enum TravelPostStatus: string
{
    case OPEN = 'OPEN';
    case CLOSED = 'CLOSED';
    case AWARDED = 'AWARDED';
    case CANCELLED = 'CANCELLED';
}