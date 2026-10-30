import { useMutation } from '@tanstack/react-query';
import { profileService } from '../services/profileService';
import { toast } from '../../../shared/components/Toast';

export function useVerifyCurrentEmailCode() {
  return useMutation({
    mutationFn: profileService.verifyCurrentEmailCode,
    onSuccess: (res) =>
      toast.success(res.message || 'Verified. Check your new email.'),
    onError: (err) => toast.error(err.message || 'Verification failed'),
  });
}