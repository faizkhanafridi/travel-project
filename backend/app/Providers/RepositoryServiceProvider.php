<?php
// app/Providers/RepositoryServiceProvider.php

namespace App\Providers;

use App\Repositories\Contracts\Agent\AgentRepositoryInterface;
use App\Repositories\Contracts\Auth\PasswordResetCodeRepositoryInterface;
use App\Repositories\Contracts\Auth\PendingRegistrationRepositoryInterface;
use App\Repositories\Contracts\Auth\UserRepositoryInterface;
use App\Repositories\Contracts\TravelService\TravelServiceRepositoryInterface;
use App\Repositories\Contracts\UserProfile\EmailChange\EmailChangeRequestRepositoryInterface;
use App\Repositories\Contracts\UserProfile\ProfileRepositoryInterface;
use App\Repositories\Eloquent\Agent\AgentRepository;
use App\Repositories\Eloquent\Auth\PasswordResetCodeRepository;
use App\Repositories\Eloquent\Auth\PendingRegistrationRepository;
use App\Repositories\Eloquent\Auth\UserRepository;
use App\Repositories\Eloquent\TravelService\TravelServiceRepository;
use App\Repositories\Eloquent\UserProfile\EmailChange\EmailChangeRequestRepository;
use App\Repositories\Eloquent\UserProfile\ProfileRepository;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Module 01

        $this->app->bind(UserRepositoryInterface::class, UserRepository::class);
        $this->app->bind(PendingRegistrationRepositoryInterface::class, PendingRegistrationRepository::class);
        $this->app->bind(PasswordResetCodeRepositoryInterface::class, PasswordResetCodeRepository::class);


        // Module 02
        $this->app->bind(ProfileRepositoryInterface::class, ProfileRepository::class);
        $this->app->bind(EmailChangeRequestRepositoryInterface::class, EmailChangeRequestRepository::class);


        // Module 03
        $this->app->bind(
            AgentRepositoryInterface::class,
            AgentRepository::class,
        );

        // Module 04
        $this->app->bind(
            TravelServiceRepositoryInterface::class,
            TravelServiceRepository::class,
        );

        // Module 05
        $this->app->bind(
            \App\Repositories\Contracts\Marketplace\MarketplaceRepositoryInterface::class,
            \App\Repositories\Eloquent\Marketplace\MarketplaceRepository::class,
        );

        // Module 06
        $this->app->bind(
            \App\Repositories\Contracts\Messaging\ConversationRepositoryInterface::class,
            \App\Repositories\Eloquent\Messaging\ConversationRepository::class,
        );
        $this->app->bind(
            \App\Repositories\Contracts\Messaging\MessageRepositoryInterface::class,
            \App\Repositories\Eloquent\Messaging\MessageRepository::class,
        );


        // Module 07
        $this->app->bind(
            \App\Repositories\Contracts\TravelPost\TravelPostRepositoryInterface::class,
            \App\Repositories\Eloquent\TravelPost\TravelPostRepository::class,
        );
        $this->app->bind(
            \App\Repositories\Contracts\TravelPost\OfferRepositoryInterface::class,
            \App\Repositories\Eloquent\TravelPost\OfferRepository::class,
        );
        $this->app->bind(
            \App\Repositories\Contracts\TravelPost\ConnectRepositoryInterface::class,
            \App\Repositories\Eloquent\TravelPost\ConnectRepository::class,
        );
    }
}
