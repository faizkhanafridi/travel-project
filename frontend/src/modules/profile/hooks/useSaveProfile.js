import { useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '../services/profileService';
import { toast } from '../../../shared/components/Toast';

// Saves a profile (create or update).
// - Uses the shared Axios instance via profileService (CSRF + Sanctum cookie safe).
// - Updates cache immediately for instant UI reflection.
// - Invalidates in background so refetches align with server truth.
export function useSaveProfile({ isEdit = false } = {}) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ payload, photoFile }) =>
      isEdit
        ? profileService.update(payload, photoFile)
        : profileService.create(payload, photoFile),

    onSuccess: (res) => {
      // Optimistic cache write — instant UI update.
      qc.setQueryData(['profile', 'me'], res);

      // Background refetch to stay in sync with server normalization.
      qc.invalidateQueries({ queryKey: ['profile', 'me'] });
      qc.invalidateQueries({ queryKey: ['auth', 'me'] });

      toast.success(res?.message || 'Profile saved.');
    },

    onError: (err) => {
      // Surface the first field error when available, otherwise the top message.
      const firstFieldError =
        err?.errors && Object.values(err.errors)[0]?.[0];
      toast.error(firstFieldError || err?.message || 'Could not save profile');
    },
  });
}