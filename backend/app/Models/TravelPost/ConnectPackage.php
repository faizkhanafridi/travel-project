<?php
// app/Models/TravelPost/ConnectPackage.php

namespace App\Models\TravelPost;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class ConnectPackage extends Model
{
    use HasUuids;

    protected $fillable = ['uuid', 'connects', 'price_usd', 'is_active', 'sort_order'];

    protected function casts(): array
    {
        return [
            'price_usd' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function uniqueIds(): array { return ['uuid']; }
}