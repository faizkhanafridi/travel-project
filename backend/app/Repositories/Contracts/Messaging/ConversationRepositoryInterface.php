<?php
// app/Repositories/Contracts/Messaging/ConversationRepositoryInterface.php

namespace App\Repositories\Contracts\Messaging;

use App\Models\Auth\User;
use App\Models\Messaging\Conversation;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface ConversationRepositoryInterface
{
    public function findByUuid(string $uuid): ?Conversation;
    public function findForUser(string $uuid, User $user): ?Conversation;
    public function findBetweenCustomerAndAgent(int $customerId, int $agentId): ?Conversation;
    public function create(array $data): Conversation;
    public function paginateForUser(User $user, array $filters): LengthAwarePaginator;
    public function touchLastMessage(Conversation $conversation): void;
}