import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { toast } from '../../../shared/components/Toast';

export function useResetPassword() {
  return useMutation({
    mutationFn: authService.resetPassword,
    onSuccess: (res) => {
      toast.success(res.message || 'Password reset successfully.');
    },
    onError: (err) => {
      toast.error(err.message || 'Reset failed');
    },
  });
}   