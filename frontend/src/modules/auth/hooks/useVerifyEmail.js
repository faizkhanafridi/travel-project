import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/authService';
import useAuthStore from '../../../shared/stores/authStore';
import { toast } from '../../../shared/components/Toast';

export function useVerifyEmail() {
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: authService.verifyEmail,
    onSuccess: (res) => {
      setUser(res.data);
      qc.setQueryData(['auth', 'me'], res);
      toast.success(res.message || 'Email verified!');
    },
    onError: (err) => {
      toast.error(err.message || 'Verification failed');
    },
  });
}