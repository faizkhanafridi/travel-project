<?php
// routes/channels.php

use App\Broadcasting\Messaging\ConversationChannel;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('conversation.{conversationUuid}', ConversationChannel::class);