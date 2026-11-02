<?php
// app/Http/Controllers/Currency/CurrencyController.php

namespace App\Http\Controllers\Currency;

use App\Http\Controllers\Controller;
use App\Services\Currency\CurrencyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CurrencyController extends Controller
{
    public function __construct(private CurrencyService $service) {}

    public function index(): JsonResponse
    {
        return response()->json([
            'base' => 'USD',
            'supported' => CurrencyService::SUPPORTED,
            'rates' => $this->service->rates(),
        ]);
    }

    public function convert(Request $request): JsonResponse
    {
        $data = $request->validate([
            'amount' => ['required', 'numeric', 'min:0'],
            'from' => ['required', 'string', 'size:3'],
            'to' => ['required', 'string', 'size:3'],
        ]);

        $from = strtoupper($data['from']);
        $to = strtoupper($data['to']);

        if (! in_array($from, CurrencyService::SUPPORTED, true) || ! in_array($to, CurrencyService::SUPPORTED, true)) {
            return response()->json(['message' => 'Unsupported currency.'], 422);
        }

        return response()->json([
            'from' => $from,
            'to' => $to,
            'amount' => (float) $data['amount'],
            'converted' => $this->service->convert((float) $data['amount'], $from, $to),
        ]);
    }
}