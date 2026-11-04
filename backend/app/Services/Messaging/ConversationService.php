<?php
// app/Services/Messaging/ConversationService.php

namespace App\Services\Messaging;

use App\Enums\Messaging\MessageType;
use App\Events\Messaging\MessageSent;
use App\Models\Agent\Agent;
use App\Models\Auth\User;
use App\Models\Messaging\Conversation;
use App\Models\Messaging\Message;
use App\Models\TravelService\TravelService;
use App\Repositories\Contracts\Messaging\ConversationRepositoryInterface;
use App\Repositories\Contracts\Messaging\MessageRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class ConversationService
{
    public function __construct(
        private ConversationRepositoryInterface $conversations,
        private MessageRepositoryInterface $messages,
    ) {}

    /**
     * Open (or reuse) a conversation between the logged-in customer and a target agent.
     * Returns the conversation and whether it was newly created.
     *
     * @return array{conversation: Conversation, created: bool}
     */
    public function openConversation(User $customer, string $agentUuid, ?string $serviceUuid): array
    {
        $agent = Agent::with(['user', 'profile'])->where('uuid', $agentUuid)->first();
        if (! $agent) {
            throw new UnprocessableEntityHttpException('Agent not found.');
        }
        if ($agent->user_id === $customer->id) {
            throw new UnprocessableEntityHttpException('You cannot open a conversation with yourself.');
        }

        $service = null;
        if ($serviceUuid) {
            $service = TravelService::where('uuid', $serviceUuid)->first();
            if (! $service || $service->agent_id !== $agent->id) {
                throw new UnprocessableEntityHttpException('Service does not belong to this agent.');
            }
        }

        $existing = $this->conversations->findBetweenCustomerAndAgent($customer->id, $agent->id);
        if ($existing) {
            if ($service && $existing->travel_service_id !== $service->id) {
                $existing->forceFill(['travel_service_id' => $service->id])->save();
            }
            return ['conversation' => $this->conversations->findForUser($existing->uuid, $customer), 'created' => false];
        }

        $conversation = DB::transaction(function () use ($customer, $agent, $service) {
            $conv = $this->conversations->create([
                'type' => 'customer_agent',
                'customer_id' => $customer->id,
                'agent_id' => $agent->id,
                'travel_service_id' => $service?->id,
                'last_message_at' => null,
            ]);

            $conv->participants()->createMany([
                ['user_id' => $customer->id, 'last_read_at' => now()],
                ['user_id' => $agent->user_id, 'last_read_at' => null],
            ]);

            return $conv;
        });

        return ['conversation' => $this->conversations->findForUser($conversation->uuid, $customer), 'created' => true];
    }

    public function list(User $user, array $filters): LengthAwarePaginator
    {
        return $this->conversations->paginateForUser($user, $filters);
    }

    public function show(User $user, string $uuid): Conversation
    {
        $conversation = $this->conversations->findForUser($uuid, $user);
        if (! $conversation) {
            throw new AccessDeniedHttpException('Conversation not found or not yours.');
        }
        return $conversation;
    }

    public function listMessages(User $user, string $uuid, array $filters): LengthAwarePaginator
    {
        $conversation = $this->show($user, $uuid);

        // opening the message list marks as read
        $this->messages->markConversationRead($conversation, $user->id);

        return $this->messages->paginateForConversation($conversation, $filters);
    }

    public function sendMessage(User $user, string $uuid, string $body, array $meta = []): Message
    {
        $conversation = $this->show($user, $uuid);

        if (trim($body) === '') {
            throw new UnprocessableEntityHttpException('Message body is required.');
        }
        if (mb_strlen($body) > 4000) {
            throw new UnprocessableEntityHttpException('Message is too long.');
        }

        $message = DB::transaction(function () use ($conversation, $user, $body, $meta) {
            $message = $this->messages->create([
                'conversation_id' => $conversation->id,
                'sender_id' => $user->id,
                'type' => MessageType::TEXT->value,
                'body' => trim($body),
                'meta' => $meta ?: null,
            ]);

            $this->conversations->touchLastMessage($conversation);

            // sender's own read pointer advances
            $conversation->participants()
                ->where('user_id', $user->id)
                ->update(['last_read_at' => now()]);

            return $message->load(['sender', 'conversation']);
        });

        broadcast(new MessageSent($message))->toOthers();

        return $message;
    }
    /**
     * Inserts a system message into an existing conversation (used by cross-module flows).
     * Does not advance the sender's read pointer, does not broadcast to the sender.
     *
     * @param array<string, mixed> $meta
     */
    public function postSystemMessage(
        \App\Models\Messaging\Conversation $conversation,
        \App\Models\Auth\User $actor,
        string $body,
        array $meta = [],
    ): \App\Models\Messaging\Message {
        $message = DB::transaction(function () use ($conversation, $actor, $body, $meta) {
            $message = $this->messages->create([
                'conversation_id' => $conversation->id,
                'sender_id' => $actor->id,
                'type' => MessageType::SYSTEM->value,
                'body' => $body,
                'meta' => $meta ?: null,
            ]);

            $this->conversations->touchLastMessage($conversation);

            return $message->load(['sender', 'conversation']);
        });

        broadcast(new MessageSent($message))->toOthers();

        return $message;
    }
    public function markRead(User $user, string $uuid): void
    {
        $conversation = $this->show($user, $uuid);
        $this->messages->markConversationRead($conversation, $user->id);
    }

    public function unreadCount(User $user, string $uuid): int
    {
        $conversation = $this->show($user, $uuid);
        return $this->messages->unreadCount($conversation, $user->id);
    }


    public function openConversationByAgent(User $customer, int $agentId, ?int $serviceId = null): Conversation
    {
        $agent = \App\Models\Agent\Agent::where('id', $agentId)->first();
        if (! $agent) {
            throw new \Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException('Agent not found.');
        }
        $serviceUuid = null;
        if ($serviceId) {
            $service = \App\Models\TravelService\TravelService::where('id', $serviceId)->first();
            $serviceUuid = $service?->uuid;
        }
        $result = $this->openConversation($customer, $agent->uuid, $serviceUuid);
        return $result['conversation'];
    }
}
