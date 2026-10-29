import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { toast } from '../../../shared/components/Toast';

export function useChangePassword() {
  return useMutation({
    mutationFn: authService.changePassword,
    onSuccess: (res) => {
      toast.success(res.message || 'Password changed.');
    },
    onError: (err) => {
      toast.error(err.message || 'Could not change password');
    },
  });
}