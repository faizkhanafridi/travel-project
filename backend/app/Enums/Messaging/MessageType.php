<?php
// app/Enums/Messaging/MessageType.php

namespace App\Enums\Messaging;

enum MessageType: string
{
    case TEXT = 'text';
    case SYSTEM = 'system';
}