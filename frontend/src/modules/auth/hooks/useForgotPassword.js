import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { toast } from '../../../shared/components/Toast';

export function useForgotPassword() {
  return useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: (res) => {
      toast.success(res.message || 'If the account exists, a reset link is on the way.');
    },
    onError: (err) => {
      toast.error(err.message || 'Could not send reset link');
    },
  });
}