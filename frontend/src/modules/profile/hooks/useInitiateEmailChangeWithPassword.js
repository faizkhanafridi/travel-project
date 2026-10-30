import { useMutation } from '@tanstack/react-query';
import { profileService } from '../services/profileService';
import { toast } from '../../../shared/components/Toast';

export function useInitiateEmailChangeWithPassword() {
  return useMutation({
    mutationFn: ({ newEmail, currentPassword }) =>
      profileService.initiateEmailChangeWithPassword(newEmail, currentPassword),
    onSuccess: (res) => toast.success(res.message || 'Code sent.'),
    onError: (err) => toast.error(err.message || 'Could not start email change'),
  });
}