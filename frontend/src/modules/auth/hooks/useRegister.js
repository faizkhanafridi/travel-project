import { useMutation } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { toast } from '../../../shared/components/Toast';

export function useRegister() {
  return useMutation({
    mutationFn: authService.register,
    onSuccess: (res) => {
      toast.success(res.message || 'Verification code sent.');
    },
    onError: (err) => {
      toast.error(err.message || 'Registration failed');
    },
  });
}