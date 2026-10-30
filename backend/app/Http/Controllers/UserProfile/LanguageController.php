<?php

namespace App\Http\Controllers\UserProfile;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserProfile\LanguageResource;
use App\Repositories\Contracts\UserProfile\LanguageRepositoryInterface;
use Illuminate\Http\JsonResponse;

class LanguageController extends Controller
{
    public function __construct(
        private LanguageRepositoryInterface $languageRepo,
    ) {}

    // GET /api/languages — public seeded list for the profile form.
    public function index(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Languages retrieved.',
            'data' => LanguageResource::collection($this->languageRepo->all()),
        ]);
    }
}