import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { toast } from '../../../shared/components/Toast';

export function useResendVerification() {
  return useMutation({
    mutationFn: authService.resendVerification,
    onSuccess: (res) => {
      toast.success(res.message || 'If pending, a new code has been sent.');
    },
    onError: (err) => {
      toast.error(err.message || 'Could not resend code');
    },
  });
}