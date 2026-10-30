import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '../services/profileService';
import { toast } from '../../../shared/components/Toast';

export function useRemovePhoto() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: profileService.removePhoto,
    onSuccess: (res) => {
      qc.setQueryData(['profile', 'me'], res);
      qc.invalidateQueries({ queryKey: ['profile', 'me'] });
      toast.success(res?.message || 'Photo removed.');
    },
    onError: (err) => {
      const firstFieldError =
        err?.errors && Object.values(err.errors)[0]?.[0];
      toast.error(firstFieldError || err?.message || 'Could not remove photo');
    },
  });
}