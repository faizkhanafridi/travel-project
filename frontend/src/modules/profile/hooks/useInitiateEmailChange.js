import { useMutation } from '@tanstack/react-query';
import { profileService } from '../services/profileService';
import { toast } from '../../../shared/components/Toast';

export function useInitiateEmailChange() {
  return useMutation({
    mutationFn: (newEmail) => profileService.initiateEmailChange(newEmail),
    onSuccess: (res) => toast.success(res.message || 'Code sent.'),
    onError: (err) => {
      // Surface backend field errors as toast; form can also read error.errors
      toast.error(err.message || 'Could not start email change');
    },
  });
}