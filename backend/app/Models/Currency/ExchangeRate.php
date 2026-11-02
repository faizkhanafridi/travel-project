<?php
// app/Models/Currency/ExchangeRate.php

namespace App\Models\Currency;

use Illuminate\Database\Eloquent\Model;

class ExchangeRate extends Model
{
    protected $fillable = ['base', 'quote', 'rate', 'fetched_at'];
    protected function casts(): array { return ['rate' => 'decimal:8', 'fetched_at' => 'datetime']; }
}