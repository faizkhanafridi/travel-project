<?php
// app/Repositories/Eloquent/Messaging/ConversationRepository.php

namespace App\Repositories\Eloquent\Messaging;

use App\Models\Agent\Agent;
use App\Models\Auth\User;
use App\Models\Messaging\Conversation;
use App\Repositories\Contracts\Messaging\ConversationRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

class ConversationRepository implements ConversationRepositoryInterface
{
    public function findByUuid(string $uuid): ?Conversation
    {
        return Conversation::with(['customer', 'agentRecord.user', 'agentRecord.profile', 'travelService', 'lastMessage'])
            ->where('uuid', $uuid)
            ->first();
    }

    public function findForUser(string $uuid, User $user): ?Conversation
    {
        // return Conversation::with(['customer', 'agentRecord.user', 'agentRecord.profile', 'travelService', 'lastMessage'])
        return Conversation::with(['customer.profile', 'agentRecord.user', 'agentRecord.profile', 'travelService', 'lastMessage'])

            ->where('uuid', $uuid)
            ->where(function ($q) use ($user) {
                $q->where('customer_id', $user->id)
                  ->orWhereHas('agentRecord', fn ($a) => $a->where('user_id', $user->id));
            })
            ->first();
    }

    public function findBetweenCustomerAndAgent(int $customerId, int $agentId): ?Conversation
    {
        return Conversation::where('customer_id', $customerId)
            ->where('agent_id', $agentId)
            ->first();
    }

    public function create(array $data): Conversation
    {
        $data['uuid'] = $data['uuid'] ?? (string) Str::uuid();
        return Conversation::create($data);
    }

    public function paginateForUser(User $user, array $filters): LengthAwarePaginator
    {
        $query = Conversation::with(['customer.profile', 'agentRecord.user', 'agentRecord.profile', 'lastMessage'])
            ->where(function ($q) use ($user) {
                $q->where('customer_id', $user->id)
                  ->orWhereHas('agentRecord', fn ($a) => $a->where('user_id', $user->id));
            })
            ->whereNotNull('last_message_at')
            ->orderByDesc('last_message_at')
            ->orderByDesc('id');

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search, $user) {
                $q->whereHas('customer', fn ($c) => $c->where('name', 'like', "%{$search}%"))
                  ->orWhereHas('agentRecord.user', fn ($a) => $a->where('name', 'like', "%{$search}%"))
                  ->orWhereHas('agentRecord.profile', fn ($p) => $p->where('agency_name', 'like', "%{$search}%"));
            });
        }

        return $query->paginate((int) ($filters['per_page'] ?? 20));
    }

    public function touchLastMessage(Conversation $conversation): void
    {
        $conversation->forceFill(['last_message_at' => now()])->save();
    }
}