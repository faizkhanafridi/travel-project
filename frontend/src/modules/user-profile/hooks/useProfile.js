import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '../services/profileService';

export function useMyProfile() {
  return useQuery({
    queryKey: ['profile', 'me'],
    queryFn: profileService.show,
    staleTime: 30_000,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: profileService.update,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile', 'me'] });
    },
  });
}

export function usePublicProfile(uuid) {
  return useQuery({
    queryKey: ['profile', 'public', uuid],
    queryFn: () => profileService.publicShow(uuid),
    enabled: !!uuid,
  });
}

export function useEmailChangeStatus() {
  return useQuery({
    queryKey: ['profile', 'email-change', 'status'],
    queryFn: profileService.emailStatus,
    staleTime: 10_000,
  });
}


export function useMyAgent() {
  return useQuery({
    queryKey: ['agent', 'account'],
    queryFn: profileService.myAgent,
    staleTime: 60_000,
  });
}