<?php
// app/Services/TravelPost/OfferService.php

namespace App\Services\TravelPost;

use App\Enums\TravelPost\OfferStatus;
use App\Enums\TravelPost\TravelPostType;
use App\Models\Agent\Agent;
use App\Models\Auth\User;
use App\Models\TravelPost\TravelOffer;
use App\Models\TravelPost\TravelPost;
use App\Repositories\Contracts\TravelPost\OfferRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\UnprocessableEntityHttpException;

class OfferService
{
    public function __construct(
        private OfferRepositoryInterface $offers,
        private TravelPostService $posts,
        private ConnectService $connects,
    ) {}

    public function submit(User $agentUser, TravelPost $post, array $data): TravelOffer
    {
        if (! $post->isOpen()) {
            throw new UnprocessableEntityHttpException('This post is not open for offers.');
        }

        $agent = Agent::where('user_id', $agentUser->id)->first();
        if (! $agent || $agent->status?->value !== 'APPROVED') {
            throw new AccessDeniedHttpException('Only approved agents can submit offers.');
        }

        if ($post->type === TravelPostType::SERVICE_REQUEST && $post->agent_id !== $agent->id) {
            throw new AccessDeniedHttpException('This request is for another agent.');
        }

        $existing = $this->offers->findForPostAndAgent($post, $agent);
        if ($existing && in_array($existing->status, [OfferStatus::PENDING, OfferStatus::SHORTLISTED, OfferStatus::ACCEPTED], true)) {
            throw new UnprocessableEntityHttpException('You already submitted an offer for this post.');
        }

        $requirements = $data['requirements'] ?? [];
        if (count($requirements) < 2) {
            throw new UnprocessableEntityHttpException('Add at least 2 requirements.');
        }

        // Global posts cost connects — service requests do not
        $cost = $post->type === TravelPostType::GLOBAL
            ? ConnectService::GLOBAL_POST_OFFER_COST
            : 0;

        return DB::transaction(function () use ($agent, $post, $data, $requirements, $cost) {
            if ($cost > 0) {
                $this->connects->spend($agent, $cost, 'travel_offer', $post->id, 'Offer on global post');
            }

            // If a previous (rejected/withdrawn) offer exists, reuse the row
            $offer = $this->offers->findForPostAndAgent($post, $agent);
            if ($offer) {
                $offer = $this->offers->update($offer, [
                    'amount' => $data['amount'],
                    'currency' => 'USD',
                    'duration' => $data['duration'],
                    'duration_unit' => $data['duration_unit'],
                    'message' => $data['message'],
                    'inclusions' => $data['inclusions'] ?? [],
                    'itinerary' => $data['itinerary'] ?? null,
                    'connects_spent' => $offer->connects_spent + $cost,
                    'status' => OfferStatus::PENDING->value,
                    'decided_at' => null,
                ]);
                $offer->requirements()->delete();
            } else {
                $offer = $this->offers->create([
                    'travel_post_id' => $post->id,
                    'agent_id' => $agent->id,
                    'amount' => $data['amount'],
                    'currency' => 'USD',
                    'duration' => $data['duration'],
                    'duration_unit' => $data['duration_unit'],
                    'message' => $data['message'],
                    'inclusions' => $data['inclusions'] ?? [],
                    'itinerary' => $data['itinerary'] ?? null,
                    'connects_spent' => $cost,
                    'status' => OfferStatus::PENDING->value,
                ]);
            }

            foreach (array_values($requirements) as $i => $req) {
                $offer->requirements()->create([
                    'uuid' => (string) Str::uuid(),
                    'title' => $req['title'],
                    'description' => $req['description'] ?? null,
                    'answer_type' => $req['answer_type'] ?? 'text',
                    'validation_config' => $req['validation_config'] ?? null,
                    'sort_order' => $i,
                ]);
            }

            // For private service requests, post a system message into the shared conversation
            if ($post->type === \App\Enums\TravelPost\TravelPostType::SERVICE_REQUEST) {
                $conversations = app(\App\Services\Messaging\ConversationService::class);
                $conversation = $conversations->openConversationByAgent(
                    $post->customer,
                    $post->agent_id,
                    $post->travel_service_id,
                );

                $conversations->postSystemMessage(
                    $conversation,
                    $agent->user,
                    'New offer submitted for "' . $post->title . '"',
                    [
                        'kind' => 'travel_offer_submitted',
                        'travel_post_uuid' => $post->uuid,
                        'offer_uuid' => $offer->uuid,
                        'amount' => (float) $offer->amount,
                        'currency' => $offer->currency,
                        'action' => 'view_offer',
                    ],
                );
            }

            return $offer->load(['requirements', 'agent.user', 'agent.profile']);
        });
    }

    // public function decide(User $customer, TravelOffer $offer, string $decision): TravelOffer
    // {
    //     $post = $offer->post;
    //     if (! $post || $post->customer_id !== $customer->id) {
    //         throw new AccessDeniedHttpException('Not your post.');
    //     }
    //     if (! $post->isOpen()) {
    //         throw new UnprocessableEntityHttpException('Post is no longer open.');
    //     }
    //     if ($offer->status !== OfferStatus::PENDING && $offer->status !== OfferStatus::SHORTLISTED) {
    //         throw new UnprocessableEntityHttpException('Offer already decided.');
    //     }

    //     return DB::transaction(function () use ($post, $offer, $decision) {
    //         if ($decision === 'shortlist') {
    //             return $this->offers->update($offer, [
    //                 'status' => OfferStatus::SHORTLISTED->value,
    //             ]);
    //         }
    //         if ($decision === 'reject') {
    //             return $this->offers->update($offer, [
    //                 'status' => OfferStatus::REJECTED->value,
    //                 'decided_at' => now(),
    //             ]);
    //         }
    //         if ($decision === 'accept') {
    //             $updated = $this->offers->update($offer, [
    //                 'status' => OfferStatus::ACCEPTED->value,
    //                 'decided_at' => now(),
    //             ]);

    //             // Reject all other pending/shortlisted offers on this post
    //             $offer->post->offers()
    //                 ->where('id', '!=', $offer->id)
    //                 ->whereIn('status', [OfferStatus::PENDING->value, OfferStatus::SHORTLISTED->value])
    //                 ->update([
    //                     'status' => OfferStatus::REJECTED->value,
    //                     'decided_at' => now(),
    //                 ]);

    //             $this->posts->markAwarded($post, $offer->id);

    //             return $updated;
    //         }
            

    //         throw new UnprocessableEntityHttpException('Invalid decision.');
    //     });
    // }

        public function decide(User $customer, TravelOffer $offer, string $decision): TravelOffer
    {
        $post = $offer->post;
        if (! $post || $post->customer_id !== $customer->id) {
            throw new AccessDeniedHttpException('Not your post.');
        }
        if (! $post->isOpen()) {
            throw new UnprocessableEntityHttpException('Post is no longer open.');
        }
        if ($offer->status !== OfferStatus::PENDING && $offer->status !== OfferStatus::SHORTLISTED) {
            throw new UnprocessableEntityHttpException('Offer already decided.');
        }

        return DB::transaction(function () use ($post, $offer, $decision) {
            if ($decision === 'shortlist') {
                return $this->offers->update($offer, [
                    'status' => OfferStatus::SHORTLISTED->value,
                ]);
            }

            if ($decision === 'reject') {
                $updated = $this->offers->update($offer, [
                    'status' => OfferStatus::REJECTED->value,
                    'decided_at' => now(),
                ]);

                // System message only for private service-request posts
                if ($post->type === TravelPostType::SERVICE_REQUEST) {
                    $conversations = app(\App\Services\Messaging\ConversationService::class);
                    $conversation = $conversations->openConversationByAgent(
                        $post->customer,
                        $post->agent_id,
                        $post->travel_service_id,
                    );

                    $conversations->postSystemMessage(
                        $conversation,
                        $post->customer,
                        'Offer rejected for "' . $post->title . '"',
                        [
                            'kind' => 'travel_offer_reject',
                            'travel_post_uuid' => $post->uuid,
                            'offer_uuid' => $offer->uuid,
                            'action' => 'view_post',
                        ],
                    );
                }

                return $updated;
            }

            if ($decision === 'accept') {
                $updated = $this->offers->update($offer, [
                    'status' => OfferStatus::ACCEPTED->value,
                    'decided_at' => now(),
                ]);

                // Reject all other pending/shortlisted offers on this post
                $offer->post->offers()
                    ->where('id', '!=', $offer->id)
                    ->whereIn('status', [OfferStatus::PENDING->value, OfferStatus::SHORTLISTED->value])
                    ->update([
                        'status' => OfferStatus::REJECTED->value,
                        'decided_at' => now(),
                    ]);

                $this->posts->markAwarded($post, $offer->id);

                // System message only for private service-request posts
                if ($post->type === TravelPostType::SERVICE_REQUEST) {
                    $conversations = app(\App\Services\Messaging\ConversationService::class);
                    $conversation = $conversations->openConversationByAgent(
                        $post->customer,
                        $post->agent_id,
                        $post->travel_service_id,
                    );

                    $conversations->postSystemMessage(
                        $conversation,
                        $post->customer,
                        'Offer accepted for "' . $post->title . '"',
                        [
                            'kind' => 'travel_offer_accept',
                            'travel_post_uuid' => $post->uuid,
                            'offer_uuid' => $offer->uuid,
                            'amount' => (float) $offer->amount,
                            'currency' => $offer->currency,
                            'action' => 'proceed_to_booking',
                        ],
                    );
                }

                return $updated;
            }

            throw new UnprocessableEntityHttpException('Invalid decision.');
        });
    }

    public function withdraw(User $agentUser, TravelOffer $offer): TravelOffer
    {
        $agent = Agent::where('user_id', $agentUser->id)->first();
        if (! $agent || $offer->agent_id !== $agent->id) {
            throw new AccessDeniedHttpException('Not your offer.');
        }
        if ($offer->status !== OfferStatus::PENDING && $offer->status !== OfferStatus::SHORTLISTED) {
            throw new UnprocessableEntityHttpException('Offer cannot be withdrawn.');
        }

        return DB::transaction(function () use ($offer) {
            $updated = $this->offers->update($offer, [
                'status' => OfferStatus::WITHDRAWN->value,
                'decided_at' => now(),
            ]);

            // refund connects for global offers
            if ($offer->connects_spent > 0) {
                $agent = $offer->agent;
                $this->connects->refund($agent, $offer->connects_spent, 'travel_offer', $offer->id, 'Refund on withdrawal');
            }

            return $updated;
        });
    }

    public function listForPost(TravelPost $post, array $filters): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        return $this->offers->paginateForPost($post, $filters);
    }

    public function listForAgent(Agent $agent, array $filters): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        return $this->offers->paginateForAgent($agent, $filters);
    }
}
