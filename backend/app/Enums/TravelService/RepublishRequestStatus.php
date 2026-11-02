<?php
// app/Enums/TravelService/RepublishRequestStatus.php

namespace App\Enums\TravelService;

enum RepublishRequestStatus: string
{
    case PENDING = 'PENDING';
    case APPROVED = 'APPROVED';
    case REJECTED = 'REJECTED';
}