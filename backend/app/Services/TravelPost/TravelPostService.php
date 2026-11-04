<?php
// app/Services/TravelPost/TravelPostService.php

namespace App\Services\TravelPost;

use App\Enums\TravelPost\TravelPostStatus;
use App\Enums\TravelPost\TravelPostType;
use App\Models\Agent\Agent;
use App\Models\Auth\User;
use App\Models\TravelPost\TravelPost;
use App\Models\TravelService\ServiceCategory;
use App\Models\TravelService\TravelService;
use App\Repositories\Contracts\TravelPost\TravelPostRepositoryInterface;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;
use App\Enums\Messaging\MessageType;
use App\Models\Messaging\Conversation;
use App\Models\Messaging\Message;
use App\Services\Messaging\ConversationService;
use App\Events\Messaging\MessageSent;
use Illuminate\Support\Facades\DB;

class TravelPostService
{
    // public function __construct(private TravelPostRepositoryInterface $posts) {}

    public function __construct(
        private TravelPostRepositoryInterface $posts,
        private ConversationService $conversations,
    ) {}
    public function createGlobal(User $customer, array $data): TravelPost
    {
        $this->assertCategoryPair($data['category_id'], $data['subcategory_id']);
        $sub = ServiceCategory::find($data['subcategory_id']);

        return $this->posts->create([
            'customer_id' => $customer->id,
            'type' => TravelPostType::GLOBAL->value,
            'status' => TravelPostStatus::OPEN->value,
            'title' => $data['title'],
            'description' => $data['description'],
            'category_id' => $data['category_id'],
            'subcategory_id' => $data['subcategory_id'],
            'milestone_model' => $sub->milestone_model,
            'duration' => $data['duration'],
            'duration_unit' => $data['duration_unit'],
            'destination_country' => $data['destination_country'],
            'destination_city' => $data['destination_city'],
            'travel_date' => $data['travel_date'] ?? null,
            'travelers_total' => $data['travelers_total'] ?? 1,
            'travelers_adults' => $data['travelers_adults'] ?? 1,
            'travelers_children' => $data['travelers_children'] ?? 0,
            'budget_min' => $data['budget_min'] ?? null,
            'budget_max' => $data['budget_max'] ?? null,
            'currency' => 'USD',
            'services_needed' => $data['services_needed'] ?? [],
            'additional_requirements' => $data['additional_requirements'] ?? null,
        ]);
    }

    // public function createServiceRequest(User $customer, TravelService $service, array $data): TravelPost
    // {
    //     if ($service->status?->value !== 'PUBLISHED') {
    //         throw new UnprocessableEntityHttpException('Service is not published.');
    //     }

    //     return $this->posts->create([
    //         'customer_id' => $customer->id,
    //         'type' => TravelPostType::SERVICE_REQUEST->value,
    //         'status' => TravelPostStatus::OPEN->value,
    //         'travel_service_id' => $service->id,
    //         'agent_id' => $service->agent_id,
    //         'title' => $service->title,
    //         'description' => $data['description'],
    //         'category_id' => $service->category_id,
    //         'subcategory_id' => $service->subcategory_id,
    //         'milestone_model' => $service->category?->milestone_model ?? '1_step',
    //         'duration' => $data['duration'],
    //         'duration_unit' => $data['duration_unit'],
    //         'destination_country' => $service->destination_country,
    //         'destination_city' => $service->destination_city,
    //         'preferred_date' => $data['preferred_date'] ?? null,
    //         'travelers_total' => $data['travelers_total'] ?? 1,
    //         'travelers_adults' => $data['travelers_adults'] ?? 1,
    //         'travelers_children' => $data['travelers_children'] ?? 0,
    //         'budget_min' => $data['budget_min'] ?? null,
    //         'budget_max' => $data['budget_max'] ?? null,
    //         'currency' => 'USD',
    //         'additional_requirements' => $data['additional_requirements'] ?? null,
    //     ]);
    // }

    // main one 
    //     public function createServiceRequest(User $customer, TravelService $service, array $data): TravelPost
    // {
    //     $this->assertCustomer($customer);

    //     if ($service->status?->value !== 'PUBLISHED') {
    //         throw new UnprocessableEntityHttpException('Service is not published.');
    //     }

    //     $post = $this->posts->create([
    //         'customer_id' => $customer->id,
    //         'type' => TravelPostType::SERVICE_REQUEST->value,
    //         'status' => TravelPostStatus::OPEN->value,
    //         'travel_service_id' => $service->id,
    //         'agent_id' => $service->agent_id,
    //         'title' => $service->title,
    //         'description' => $data['description'],
    //         'category_id' => $service->category_id,
    //         'subcategory_id' => $service->subcategory_id,
    //         'milestone_model' => $service->category?->milestone_model ?? '1_step',
    //         'duration' => $data['duration'],
    //         'duration_unit' => $data['duration_unit'],
    //         'destination_country' => $service->destination_country,
    //         'destination_city' => $service->destination_city,
    //         'preferred_date' => $data['preferred_date'] ?? null,
    //         'travelers_total' => $data['travelers_total'] ?? 1,
    //         'travelers_adults' => $data['travelers_adults'] ?? 1,
    //         'travelers_children' => $data['travelers_children'] ?? 0,
    //         'budget_min' => $data['budget_min'] ?? null,
    //         'budget_max' => $data['budget_max'] ?? null,
    //         'currency' => 'USD',
    //         'additional_requirements' => $data['additional_requirements'] ?? null,
    //     ]);

    //     // Open (or reuse) the conversation between this customer and the service's agent.
    //     $result = $this->conversations->openConversation(
    //         $customer,
    //         $service->agent->uuid,
    //         $service->uuid,
    //     );
    //     $conversation = $result['conversation'];

    //     // System message with meta pointing to the travel post — frontend renders a card.
    //     $message = Message::create([
    //         'uuid' => (string) \Illuminate\Support\Str::uuid(),
    //         'conversation_id' => $conversation->id,
    //         'sender_id' => $customer->id,
    //         'type' => MessageType::SYSTEM->value,
    //         'body' => "Private trip request from {$customer->name}",
    //         'meta' => [
    //             'kind' => 'service_trip_request',
    //             'travel_post_uuid' => $post->uuid,
    //             'service_uuid' => $service->uuid,
    //             'service_title' => $service->title,
    //             'title' => $post->title,
    //             'description' => $post->description,
    //             'preferred_date' => $post->preferred_date?->toDateString(),
    //             'duration' => $post->duration,
    //             'duration_unit' => $post->duration_unit,
    //             'travelers' => [
    //                 'total' => $post->travelers_total,
    //                 'adults' => $post->travelers_adults,
    //                 'children' => $post->travelers_children,
    //             ],
    //             'budget' => [
    //                 'min' => (float) $post->budget_min,
    //                 'max' => (float) $post->budget_max,
    //                 'currency' => $post->currency,
    //             ],
    //         ],
    //     ]);

    //     $conversation->forceFill(['last_message_at' => now()])->save();
    //     broadcast(new MessageSent($message->load('sender', 'conversation')))->toOthers();

    //     return $post;
    // }


    public function createServiceRequest(User $customer, TravelService $service, array $data): TravelPost
    {
        if ($service->status?->value !== 'PUBLISHED') {
            throw new UnprocessableEntityHttpException('Service is not published.');
        }

        return DB::transaction(function () use ($customer, $service, $data) {
            $post = $this->posts->create([
                'customer_id' => $customer->id,
                'type' => TravelPostType::SERVICE_REQUEST->value,
                'status' => TravelPostStatus::OPEN->value,
                'travel_service_id' => $service->id,
                'agent_id' => $service->agent_id,
                'title' => $service->title,
                'description' => $data['description'],
                'category_id' => $service->category_id,
                'subcategory_id' => $service->subcategory_id,
                'milestone_model' => $service->category?->milestone_model ?? '1_step',
                'duration' => $data['duration'],
                'duration_unit' => $data['duration_unit'],
                'destination_country' => $service->destination_country,
                'destination_city' => $service->destination_city,
                'preferred_date' => $data['preferred_date'] ?? null,
                'travelers_total' => $data['travelers_total'] ?? 1,
                'travelers_adults' => $data['travelers_adults'] ?? 1,
                'travelers_children' => $data['travelers_children'] ?? 0,
                'budget_min' => $data['budget_min'] ?? null,
                'budget_max' => $data['budget_max'] ?? null,
                'currency' => 'USD',
                'additional_requirements' => $data['additional_requirements'] ?? null,
            ]);

            // Fiverr-style bridge: drop a system message into the existing 1-on-1 thread.
            $conversations = app(\App\Services\Messaging\ConversationService::class);
            $conversation = $conversations->openConversationByAgent(
                $customer,
                $service->agent_id,
                $service->id,
            );

            $conversations->postSystemMessage(
                $conversation,
                $customer,
                'Private trip request for "' . $service->title . '"',
                [
                    'kind' => 'service_trip_request',
                    'travel_post_uuid' => $post->uuid,
                    'travel_post_title' => $post->title,
                    'service_uuid' => $service->uuid,
                    'action' => 'view_request',
                ],
            );

            return $post;
        });
    }

    public function findOpen(string $uuid): TravelPost
    {
        $post = $this->posts->findByUuid($uuid);
        if (! $post) {
            throw new UnprocessableEntityHttpException('Post not found.');
        }
        return $post;
    }

    public function findForCustomer(User $customer, string $uuid): TravelPost
    {
        $post = $this->posts->findByUuid($uuid);
        if (! $post || $post->customer_id !== $customer->id) {
            throw new AccessDeniedHttpException('Not your post.');
        }
        return $post;
    }

    public function cancel(User $customer, string $uuid): TravelPost
    {
        $post = $this->findForCustomer($customer, $uuid);
        if ($post->status === TravelPostStatus::AWARDED) {
            throw new UnprocessableEntityHttpException('Cannot cancel an awarded post.');
        }
        return $this->posts->update($post, ['status' => TravelPostStatus::CANCELLED->value]);
    }

    public function listGlobal(array $filters): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        return $this->posts->paginateGlobal($filters);
    }

    public function listForCustomer(User $customer, array $filters): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        return $this->posts->paginateForCustomer($customer, $filters);
    }

    public function markAwarded(TravelPost $post, int $offerId): TravelPost
    {
        return $this->posts->update($post, [
            'status' => TravelPostStatus::AWARDED->value,
            'accepted_offer_id' => $offerId,
        ]);
    }

    private function assertCategoryPair(int $categoryId, int $subId): void
    {
        $cat = ServiceCategory::find($categoryId);
        $sub = ServiceCategory::find($subId);
        if (! $cat || $cat->parent_id !== null) {
            throw new UnprocessableEntityHttpException('Invalid category.');
        }
        if (! $sub || $sub->parent_id !== $cat->id) {
            throw new UnprocessableEntityHttpException('Subcategory does not belong to the selected category.');
        }
    }
}
