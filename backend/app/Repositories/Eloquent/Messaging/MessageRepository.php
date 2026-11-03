<?php
// app/Repositories/Eloquent/Messaging/MessageRepository.php

namespace App\Repositories\Eloquent\Messaging;

use App\Models\Messaging\Conversation;
use App\Models\Messaging\Message;
use App\Repositories\Contracts\Messaging\MessageRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

class MessageRepository implements MessageRepositoryInterface
{
    public function create(array $data): Message
    {
        $data['uuid'] = $data['uuid'] ?? (string) Str::uuid();
        return Message::create($data);
    }

    public function paginateForConversation(Conversation $conversation, array $filters): LengthAwarePaginator
    {
        $query = Message::with('sender')
            ->where('conversation_id', $conversation->id)
            ->orderByDesc('created_at');
            // ->orderByDesc('id');

        return $query->paginate((int) ($filters['per_page'] ?? 30));
    }

    public function markConversationRead(Conversation $conversation, int $userId): void
    {
        Message::where('conversation_id', $conversation->id)
            ->where('sender_id', '!=', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        $conversation->participants()
            ->where('user_id', $userId)
            ->update(['last_read_at' => now()]);
    }

    public function unreadCount(Conversation $conversation, int $userId): int
    {
        return Message::where('conversation_id', $conversation->id)
            ->where('sender_id', '!=', $userId)
            ->whereNull('read_at')
            ->count();
    }
}