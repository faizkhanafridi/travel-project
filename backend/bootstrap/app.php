<?php
// bootstrap/app.php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        channels: __DIR__ . '/../routes/channels.php',
        health: '/up',
        apiPrefix: 'api',
        then: function () {
            // auth routes MUST be wrapped in 'api' middleware so
            // statefulApi() (Sanctum stateful) is applied.

            // Module 01
            Route::middleware('api')
                ->prefix('api/auth')
                ->name('auth.')
                ->group(base_path('routes/auth.php'));


            // Module 02
            Route::middleware('api')
                ->prefix('api/user-profile')
                ->group(base_path('routes/user-profile.php'));


            // Module 03
            Route::middleware('api')
                ->prefix('api/agent')
                ->group(base_path('routes/agent.php'));

            // Module 04
            Route::middleware('api')
                ->prefix('api/services')
                ->group(base_path('routes/travel-service.php'));


            // Module 05
            Route::middleware('api')
                ->prefix('api/marketplace')
                ->group(base_path('routes/marketplace.php'));

            // Module 06
            Route::middleware('api')
                ->prefix('api/messaging')
                ->group(base_path('routes/messaging.php'));

            // Module 07
            Route::middleware('api')
                ->prefix('api/travel-post')
                ->group(base_path('routes/travel-post.php'));
        },
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->statefulApi();

        $middleware->alias([
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })
    ->withProviders([
        \App\Providers\RepositoryServiceProvider::class,
    ])
    ->create();
