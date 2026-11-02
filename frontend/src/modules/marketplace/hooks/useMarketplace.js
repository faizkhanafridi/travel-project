import { useQuery } from '@tanstack/react-query';
import { marketplaceService } from '../services/marketplaceService';
import { useCurrencyStore } from '../../travel-services/stores/currencyStore';

export function useMarketplaceFilters() {
  return useQuery({
    queryKey: ['marketplace', 'filters'],
    queryFn: marketplaceService.filters,
    staleTime: 5 * 60_000,
  });
}

export function useMarketplaceSearch(params) {
  const currency = useCurrencyStore((s) => s.currency);
 const clean = Object.fromEntries(
  Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
);

if (
  clean.price_min !== undefined &&
  clean.price_max !== undefined &&
  Number(clean.price_max) < Number(clean.price_min)
) {
  delete clean.price_max;
}

if (
  clean.duration_min !== undefined &&
  clean.duration_max !== undefined &&
  Number(clean.duration_max) < Number(clean.duration_min)
) {
  delete clean.duration_max;
}
  return useQuery({
    queryKey: ['marketplace', 'search', clean, currency],
    queryFn: () => marketplaceService.search({ ...clean, currency }),
  });
}