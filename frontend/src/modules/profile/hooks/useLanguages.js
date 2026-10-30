import { useQuery } from '@tanstack/react-query';
import { profileService } from '../services/profileService';

export function useLanguages() {
  return useQuery({
    queryKey: ['languages'],
    queryFn: profileService.getLanguages,
    staleTime: 10 * 60 * 1000, // languages change rarely
  });
}