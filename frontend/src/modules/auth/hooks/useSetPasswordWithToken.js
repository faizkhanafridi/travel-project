import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/authService';
import useAuthStore from '../../../shared/stores/authStore';
import { toast } from '../../../shared/components/Toast';

export function useSetPasswordWithToken() {
  const qc = useQueryClient();
  const patchUser = useAuthStore((s) => s.patchUser);

  return useMutation({
    mutationFn: authService.setPasswordWithToken,
    onSuccess: (res) => {
      patchUser({ has_password: true });
      qc.invalidateQueries({ queryKey: ['auth', 'me'] });
      toast.success(res?.message || 'Password set successfully.');
    },
    onError: (err) => {
      const firstFieldError =
        err?.errors && Object.values(err.errors)[0]?.[0];
      toast.error(firstFieldError || err?.message || 'Could not set password');
    },
  });
}