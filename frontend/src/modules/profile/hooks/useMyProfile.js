import { useQuery } from '@tanstack/react-query';
import { profileService } from '../services/profileService';

export function useMyProfile() {
  return useQuery({
    queryKey: ['profile', 'me'],
    queryFn: profileService.getMine,
    staleTime: 60 * 1000,
  });
}