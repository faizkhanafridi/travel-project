import { useQuery } from '@tanstack/react-query';
import { profileService } from '../services/profileService';

export function usePublicProfile(username) {
  return useQuery({
    queryKey: ['profile', 'public', username],
    queryFn: () => profileService.getPublic(username),
    enabled: !!username,
    retry: false,
    staleTime: 60 * 1000,
  });
}