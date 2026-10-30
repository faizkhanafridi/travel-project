import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '../services/profileService';
import { toast } from '../../../shared/components/Toast';

export function useUpdatePhoto() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: profileService.updatePhoto,
    onSuccess: (res) => {
      qc.setQueryData(['profile', 'me'], res);
      toast.success(res.message || 'Photo updated.');
    },
    onError: (err) => toast.error(err.message || 'Could not update photo'),
  });
}