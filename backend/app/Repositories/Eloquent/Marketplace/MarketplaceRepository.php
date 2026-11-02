<?php
// app/Repositories/Eloquent/Marketplace/MarketplaceRepository.php

namespace App\Repositories\Eloquent\Marketplace;

use App\Enums\TravelService\TravelServiceStatus;
use App\Models\TravelService\ServiceCategory;
use App\Models\TravelService\TravelService;
use App\Repositories\Contracts\Marketplace\MarketplaceRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class MarketplaceRepository implements MarketplaceRepositoryInterface
{
    public function search(array $filters): LengthAwarePaginator
    {
        $query = TravelService::query()
            ->with(['agent.profile', 'images', 'category', 'subcategory'])
            ->where('status', TravelServiceStatus::PUBLISHED->value);

        $this->applySearch($query, $filters);
        $this->applyFilters($query, $filters);
        $this->applySort($query, $filters['sort'] ?? 'recommended');

        return $query->paginate((int) ($filters['per_page'] ?? 20))->withQueryString();
    }

    public function filterOptions(): array
    {
        $countries = TravelService::query()
            ->where('status', TravelServiceStatus::PUBLISHED->value)
            ->whereNotNull('destination_country')
            ->distinct()
            ->orderBy('destination_country')
            ->pluck('destination_country')
            ->values()
            ->all();

        $cities = TravelService::query()
            ->where('status', TravelServiceStatus::PUBLISHED->value)
            ->whereNotNull('destination_city')
            ->distinct()
            ->orderBy('destination_city')
            ->pluck('destination_city')
            ->values()
            ->all();

        $durationUnits = TravelService::query()
            ->where('status', TravelServiceStatus::PUBLISHED->value)
            ->distinct()
            ->pluck('duration_unit')
            ->values()
            ->all();

        $priceRange = TravelService::query()
            ->where('status', TravelServiceStatus::PUBLISHED->value)
            ->selectRaw('MIN(price) as min_price, MAX(price) as max_price')
            ->first();

        $subcategories = ServiceCategory::query()
            ->whereNotNull('parent_id')
            ->orderBy('sort_order')
            ->get(['id', 'uuid', 'name', 'slug', 'parent_id'])
            ->map(fn ($s) => [
                'id' => $s->id,
                'uuid' => $s->uuid,
                'name' => $s->name,
                'slug' => $s->slug,
            ])
            ->all();

        return [
            'countries' => $countries,
            'cities' => $cities,
            'duration_units' => $durationUnits,
            'price_range' => [
                'min' => (float) ($priceRange->min_price ?? 0),
                'max' => (float) ($priceRange->max_price ?? 0),
                'currency' => 'USD',
            ],
            'subcategories' => $subcategories,
        ];
    }

    private function applySearch(Builder $query, array $filters): void
    {
        $q = trim((string) ($filters['q'] ?? ''));
        if ($q === '') {
            return;
        }

        $query->where(function (Builder $qry) use ($q) {
            $qry->where('title', 'like', "%{$q}%")
                ->orWhere('short_description', 'like', "%{$q}%")
                ->orWhere('destination_country', 'like', "%{$q}%")
                ->orWhere('destination_city', 'like', "%{$q}%")
                ->orWhereHas('tags', fn ($t) => $t->where('tag', 'like', "%{$q}%"))
                ->orWhereHas('category', fn ($c) => $c->where('name', 'like', "%{$q}%"))
                ->orWhereHas('subcategory', fn ($s) => $s->where('name', 'like', "%{$q}%"));
        });
    }

    private function applyFilters(Builder $query, array $filters): void
    {
        if (! empty($filters['subcategory_id'])) {
            $query->where('subcategory_id', (int) $filters['subcategory_id']);
        }
        if (! empty($filters['category_id'])) {
            $query->where('category_id', (int) $filters['category_id']);
        }
        if (! empty($filters['destination_country'])) {
            $query->where('destination_country', $filters['destination_country']);
        }
        if (! empty($filters['destination_city'])) {
            $query->where('destination_city', $filters['destination_city']);
        }
        if (isset($filters['price_min']) && $filters['price_min'] !== '') {
            $query->where('price', '>=', (float) $filters['price_min']);
        }
        if (isset($filters['price_max']) && $filters['price_max'] !== '') {
            $query->where('price', '<=', (float) $filters['price_max']);
        }
        if (isset($filters['duration_min']) && $filters['duration_min'] !== '') {
            $query->where('duration', '>=', (int) $filters['duration_min']);
        }
        if (isset($filters['duration_max']) && $filters['duration_max'] !== '') {
            $query->where('duration', '<=', (int) $filters['duration_max']);
        }
        if (! empty($filters['duration_unit'])) {
            $query->where('duration_unit', $filters['duration_unit']);
        }
    }

    private function applySort(Builder $query, string $sort): void
    {
        switch ($sort) {
            case 'newest':
                $query->orderByDesc('published_at');
                break;
            case 'lowest_price':
                $query->orderBy('price')->orderByDesc('published_at');
                break;
            case 'highest_price':
                $query->orderByDesc('price')->orderByDesc('published_at');
                break;
            case 'recommended':
            default:
                // Deterministic default ranking: newest published first.
                $query->orderByDesc('published_at');
                break;
        }
    }
}