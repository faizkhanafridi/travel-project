<?php
// app/Http/Controllers/Messaging/ConversationController.php

namespace App\Http\Controllers\Messaging;

use App\Http\Controllers\Controller;
use App\Http\Requests\Messaging\SendMessageRequest;
use App\Http\Requests\Messaging\StartConversationRequest;
use App\Http\Resources\Messaging\ConversationResource;
use App\Http\Resources\Messaging\MessageResource;
use App\Repositories\Contracts\Messaging\MessageRepositoryInterface;
use App\Services\Messaging\ConversationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ConversationController extends Controller
{
    public function __construct(
        private ConversationService $service,
        private MessageRepositoryInterface $messages,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $paginator = $this->service->list($request->user(), $request->only(['search', 'per_page']));

        $paginator->through(function ($conversation) use ($request) {
            $conversation->unread_count = $this->messages->unreadCount($conversation, $request->user()->id);
            return $conversation;
        });

        return ConversationResource::collection($paginator)->response();
    }

    public function start(StartConversationRequest $request): JsonResponse
    {
        $result = $this->service->openConversation(
            $request->user(),
            (string) $request->string('agent_uuid'),
            $request->input('service_uuid') ? (string) $request->input('service_uuid') : null,
        );

        $conversation = $result['conversation'];
        $conversation->unread_count = $this->messages->unreadCount($conversation, $request->user()->id);

        return (new ConversationResource($conversation))
            ->additional(['created' => $result['created']])
            ->response()
            ->setStatusCode($result['created'] ? 201 : 200);
    }

    public function show(Request $request, string $uuid): JsonResponse
    {
        $conversation = $this->service->show($request->user(), $uuid);
        $conversation->unread_count = $this->messages->unreadCount($conversation, $request->user()->id);

        return (new ConversationResource($conversation))->response();
    }

    public function messages(Request $request, string $uuid): JsonResponse
    {
        $paginator = $this->service->listMessages(
            $request->user(),
            $uuid,
            $request->only(['per_page']),
        );

        return MessageResource::collection($paginator)->response();
    }

    public function send(SendMessageRequest $request, string $uuid): JsonResponse
    {
        $message = $this->service->sendMessage(
            $request->user(),
            $uuid,
            (string) $request->string('body'),
            (array) ($request->input('meta') ?? []),
        );

        return (new MessageResource($message))->response()->setStatusCode(201);
    }

    public function markRead(Request $request, string $uuid): JsonResponse
    {
        $this->service->markRead($request->user(), $uuid);

        return response()->json(['message' => 'Conversation marked as read.']);
    }

    public function unread(Request $request, string $uuid): JsonResponse
    {
        return response()->json([
            'unread' => $this->service->unreadCount($request->user(), $uuid),
        ]);
    }
}