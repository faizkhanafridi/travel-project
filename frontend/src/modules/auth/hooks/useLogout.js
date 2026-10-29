import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/authService';
import useAuthStore from '../../../shared/stores/authStore';
import { toast } from '../../../shared/components/Toast';

export function useLogout() {
  const qc = useQueryClient();
  const clearUser = useAuthStore((s) => s.clearUser);

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      clearUser();
      qc.removeQueries({ queryKey: ['auth', 'me'] });
      toast.success('Logged out.');
    },
    onError: () => {
      // Force local clear anyway — server session is best-effort.
      clearUser();
    },
  });
}