<?php
// app/Models/TravelService/ServiceCategory.php

namespace App\Models\TravelService;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ServiceCategory extends Model
{
    use HasUuids;

    protected $fillable = ['uuid', 'name', 'slug', 'parent_id', 'requires_packages', 'milestone_model', 'sort_order'];

    protected $hidden = ['requires_packages'];

    protected function casts(): array
    {
        return [
            'requires_packages' => 'boolean',
        ];
    }

    public function uniqueIds(): array { return ['uuid']; }

    public function parent(): BelongsTo { return $this->belongsTo(self::class, 'parent_id'); }
    public function children(): HasMany { return $this->hasMany(self::class, 'parent_id')->orderBy('sort_order'); }
}