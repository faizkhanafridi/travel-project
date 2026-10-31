<?php

namespace App\Services\Agent;

use App\Enums\Agent\AgentStatus;
use App\Enums\Agent\ApplicationEventType;
use App\Enums\Agent\DocumentType;
use App\Models\Agent\Agent;
use App\Models\User;
use App\Repositories\Contracts\Agent\AgentRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AgentApplicationService
{
    public function __construct(
        private AgentRepositoryInterface $agentRepo,
    ) {}

    public function startOrResume(User $user): Agent
    {
        if (! $user->profile) {
            throw ValidationException::withMessages([
                'profile' => ['Complete your user profile before applying to become an agent.'],
            ]);
        }

        $existing = $this->agentRepo->findByUser($user);

        if ($existing) {
            if (in_array($existing->status, [AgentStatus::DRAFT, AgentStatus::REJECTED], true)) {
                return $existing;
            }

            throw ValidationException::withMessages([
                'agent' => ['You already have an active agent application or account.'],
            ]);
        }

        return DB::transaction(fn () => $this->agentRepo->createForUser($user));
    }

    public function saveAgencyInfo(Agent $agent, array $data): Agent
    {
        $this->assertEditable($agent);

        $this->agentRepo->saveAgencyInfo($agent, [
            'agency_name' => $data['agency_name'],
            'agency_owner_name' => $data['agency_owner_name'],
            'phone' => $data['phone'] ?? null,
            'country' => $data['country'],
            'city' => $data['city'],
            'address' => $data['address'],
        ]);

        return $agent->refresh();
    }

    public function saveBusinessInfo(Agent $agent, array $data): Agent
    {
        $this->assertEditable($agent);
        $this->assertAgencyCompleted($agent);

        $this->agentRepo->saveBusinessInfo($agent, [
            'business_description' => $data['business_description'],
            'years_in_business' => (int) $data['years_in_business'],
            'business_type' => $data['business_type'],
            'registration_information' => $data['registration_information'] ?? null,
            'website' => $data['website'] ?? null,
            'social_media' => $data['social_media'] ?? [],
            'languages' => $data['languages'] ?? [],
            'specializations' => $data['specializations'] ?? [],
        ]);

        return $agent->refresh();
    }

    public function saveBusinessHours(Agent $agent, array $hours): Agent
    {
        $this->assertEditable($agent);
        $this->assertBusinessCompleted($agent);
        $this->assertRequiredDocumentsUploaded($agent);
        $this->assertHoursComplete($hours);

        DB::transaction(fn () => $this->agentRepo->replaceBusinessHours($agent, $hours));

        return $agent->refresh();
    }

    public function assertReadyForReview(Agent $agent): void
    {
        $this->assertEditable($agent);
        $this->assertAgencyCompleted($agent);
        $this->assertBusinessCompleted($agent);
        $this->assertRequiredDocumentsUploaded($agent);

        if ($agent->businessHours()->count() < 7) {
            throw ValidationException::withMessages([
                'review' => ['Configure business hours for all 7 days before reviewing.'],
            ]);
        }
    }

    public function submit(Agent $agent, User $user): Agent
    {
        $this->assertReadyForReview($agent);

        return DB::transaction(function () use ($agent, $user) {
            $next = ((int) $agent->attempts()->max('attempt_number')) + 1;

            $this->agentRepo->createAttempt($agent, [
                'attempt_number' => $next,
                'status' => AgentStatus::PENDING_REVIEW->value,
                'submitted_at' => now(),
            ]);

            $this->agentRepo->update($agent, [
                'status' => AgentStatus::PENDING_REVIEW,
                'current_attempt' => $next,
                'submitted_at' => now(),
                'rejected_at' => null,
            ]);

            $this->agentRepo->logEvent($agent, [
                'event' => $next === 1
                    ? ApplicationEventType::SUBMITTED->value
                    : ApplicationEventType::RESUBMITTED->value,
                'actor_id' => $user->id,
                'meta' => ['attempt' => $next],
            ]);

            return $agent->refresh();
        });
    }

    private function assertEditable(Agent $agent): void
    {
        if (! $agent->isEditable()) {
            throw ValidationException::withMessages([
                'agent' => ['This application cannot be edited in its current status.'],
            ]);
        }
    }

    private function assertAgencyCompleted(Agent $agent): void
    {
        if (! $agent->profile || ! $agent->profile->agency_information_completed) {
            throw ValidationException::withMessages([
                'step' => ['Complete agency information first.'],
            ]);
        }
    }

    private function assertBusinessCompleted(Agent $agent): void
    {
        if (! $agent->profile || ! $agent->profile->business_information_completed) {
            throw ValidationException::withMessages([
                'step' => ['Complete business information first.'],
            ]);
        }
    }

    private function assertRequiredDocumentsUploaded(Agent $agent): void
    {
        foreach (DocumentType::required() as $required) {
            if (! $agent->documents()->where('type', $required->value)->exists()) {
                throw ValidationException::withMessages([
                    'documents' => ["Missing required document: {$required->value}."],
                ]);
            }
        }
    }

    private function assertHoursComplete(array $hours): void
    {
        $days = collect($hours)->pluck('day_of_week')->map(fn ($d) => (int) $d)->unique()->sort()->values();

        if ($days->count() !== 7 || $days->first() !== 0 || $days->last() !== 6) {
            throw ValidationException::withMessages([
                'business_hours' => ['Provide business hours for all 7 days (0–6).'],
            ]);
        }

        foreach ($hours as $h) {
            if (empty($h['is_closed'])) {
                if (empty($h['open_time']) || empty($h['close_time'])) {
                    throw ValidationException::withMessages([
                        'business_hours' => ['Open and close times are required for open days.'],
                    ]);
                }
                if ($h['open_time'] >= $h['close_time']) {
                    throw ValidationException::withMessages([
                        'business_hours' => ['Close time must be after open time.'],
                    ]);
                }
            }
        }
    }
}