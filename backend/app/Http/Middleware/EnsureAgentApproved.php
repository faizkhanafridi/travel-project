<?php

namespace App\Http\Middleware\Agent;

use App\Enums\Agent\AgentStatus;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAgentApproved
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->agent || $user->agent->status !== AgentStatus::APPROVED) {
            return response()->json([
                'success' => false,
                'message' => 'Agent access requires an approved account.',
                'data' => null,
                'errors' => null,
            ], 403);
        }

        return $next($request);
    }
}