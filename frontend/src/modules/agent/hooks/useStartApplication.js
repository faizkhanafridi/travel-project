import { useMutation, useQueryClient } from '@tanstack/react-query';
import { agentService } from '../services/agentService';
import { toast } from '../../../shared/components/Toast';

export function useStartApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: agentService.startApplication,
    onSuccess: (res) => {
      qc.setQueryData(['agent', 'application'], res);
      qc.invalidateQueries({ queryKey: ['agent', 'application'] });
    },
    onError: (err) => {
      const e = err?.errors && Object.values(err.errors)[0]?.[0];
      toast.error(e || err.message || 'Could not start application');
    },
  });
}