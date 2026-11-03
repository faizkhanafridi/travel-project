<?php
// app/Repositories/Contracts/Messaging/MessageRepositoryInterface.php

namespace App\Repositories\Contracts\Messaging;

use App\Models\Messaging\Conversation;
use App\Models\Messaging\Message;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface MessageRepositoryInterface
{
    public function create(array $data): Message;
    public function paginateForConversation(Conversation $conversation, array $filters): LengthAwarePaginator;
    public function markConversationRead(Conversation $conversation, int $userId): void;
    public function unreadCount(Conversation $conversation, int $userId): int;
}