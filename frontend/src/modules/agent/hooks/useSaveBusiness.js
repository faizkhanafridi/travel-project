import { useMutation, useQueryClient } from '@tanstack/react-query';
import { agentService } from '../services/agentService';
import { toast } from '../../../shared/components/Toast';

export function useSaveBusiness() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: agentService.saveBusiness,
    onSuccess: (res) => {
      qc.setQueryData(['agent', 'application'], res);
      qc.invalidateQueries({ queryKey: ['agent', 'application'] });
      toast.success(res?.message || 'Business information saved.');
    },
    onError: (err) => {
      const e = err?.errors && Object.values(err.errors)[0]?.[0];
      toast.error(e || err.message || 'Could not save business info');
    },
  });
}