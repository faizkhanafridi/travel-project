<?php
// app/Services/Currency/CurrencyService.php

namespace App\Services\Currency;

use App\Models\Currency\ExchangeRate;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CurrencyService
{
    public const SUPPORTED = ['USD', 'EUR', 'GBP', 'PKR', 'AED', 'SAR', 'INR', 'CAD', 'AUD'];

    public function rates(): array
    {
        return Cache::remember('currency:rates:usd', now()->addHours(6), function () {
            $existing = ExchangeRate::where('base', 'USD')->pluck('rate', 'quote')->all();
            if (! empty($existing)) {
                return $existing;
            }
            return $this->refresh();
        });
    }

    public function refresh(): array
    {
        try {
            $response = Http::timeout(6)->get('https://open.er-api.com/v6/latest/USD');
            if (! $response->ok()) {
                throw new \RuntimeException('rates fetch failed');
            }
            $rates = $response->json('rates') ?? [];
            $now = now();
            foreach (self::SUPPORTED as $code) {
                if ($code === 'USD' || ! isset($rates[$code])) {
                    continue;
                }
                ExchangeRate::updateOrCreate(
                    ['base' => 'USD', 'quote' => $code],
                    ['rate' => $rates[$code], 'fetched_at' => $now]
                );
            }
            Cache::forget('currency:rates:usd');
            return ExchangeRate::where('base', 'USD')->pluck('rate', 'quote')->all();
        } catch (\Throwable $e) {
            Log::warning('currency refresh failed', ['error' => $e->getMessage()]);
            return ExchangeRate::where('base', 'USD')->pluck('rate', 'quote')->all();
        }
    }

    public function convert(float $amount, string $from, string $to): float
    {
        $from = strtoupper($from);
        $to = strtoupper($to);
        if ($from === $to) {
            return round($amount, 2);
        }
        $rates = $this->rates();
        $usd = $from === 'USD' ? $amount : ($amount / (float) ($rates[$from] ?? 1));
        return round($usd * (float) ($rates[$to] ?? 1), 2);
    }
}