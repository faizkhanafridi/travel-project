<?php
// app/Broadcasting/Messaging/ConversationChannel.php

namespace App\Broadcasting\Messaging;

use App\Models\Auth\User;
use App\Models\Messaging\Conversation;

class ConversationChannel
{
    /**
     * Authorize whether the given user may listen on this private conversation channel.
     */
    public function join(User $user, string $conversationUuid): bool
    {
        $conversation = Conversation::where('uuid', $conversationUuid)->first();
        if (! $conversation) {
            return false;
        }
        return $conversation->includesUser($user->id);
    }
}