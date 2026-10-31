import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAgentService } from '../../services/adminAgentService';
import { toast } from '../../../../shared/components/Toast';

export function useAdminAgentAction() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ uuid, action, reason }) => {
      switch (action) {
        case 'under-review':
          return adminAgentService.markUnderReview(uuid);
        case 'approve':
          return adminAgentService.approve(uuid);
        case 'reject':
          return adminAgentService.reject(uuid, reason);
        case 'suspend':
          return adminAgentService.suspend(uuid, reason);
        case 'unsuspend':
          return adminAgentService.unsuspend(uuid);
        default:
          throw new Error('Unknown action');
      }
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['admin', 'agents'] });
      toast.success(res?.message || 'Action completed.');
    },
    onError: (err) => {
      const e = err?.errors && Object.values(err.errors)[0]?.[0];
      toast.error(e || err.message || 'Action failed');
    },
  });
}