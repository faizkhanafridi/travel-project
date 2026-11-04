<?php
// app/Enums/TravelPost/TravelPostType.php

namespace App\Enums\TravelPost;

enum TravelPostType: string
{
    case GLOBAL = 'global';
    case SERVICE_REQUEST = 'service_request';
}