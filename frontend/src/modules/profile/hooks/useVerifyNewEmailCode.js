import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '../services/profileService';
import useAuthStore from '../../../shared/stores/authStore';
import { toast } from '../../../shared/components/Toast';

export function useVerifyNewEmailCode() {
  const qc = useQueryClient();
  const patchUser = useAuthStore((s) => s.patchUser);

  return useMutation({
    mutationFn: profileService.verifyNewEmailCode,
    onSuccess: (res) => {
      // Backend returns updated UserResource
      if (res.data?.email) patchUser({ email: res.data.email });
      qc.invalidateQueries({ queryKey: ['auth', 'me'] });
      toast.success(res.message || 'Email address updated.');
    },
    onError: (err) => toast.error(err.message || 'Verification failed'),
  });
}