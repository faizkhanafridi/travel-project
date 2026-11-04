<?php
// app/Enums/TravelPost/OfferStatus.php

namespace App\Enums\TravelPost;

enum OfferStatus: string
{
    case PENDING = 'PENDING';
    case SHORTLISTED = 'SHORTLISTED';
    case ACCEPTED = 'ACCEPTED';
    case REJECTED = 'REJECTED';
    case WITHDRAWN = 'WITHDRAWN';
}