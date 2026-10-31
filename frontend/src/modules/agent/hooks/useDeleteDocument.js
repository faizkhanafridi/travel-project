import { useMutation, useQueryClient } from '@tanstack/react-query';
import { agentService } from '../services/agentService';
import { toast } from '../../../shared/components/Toast';

export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: agentService.deleteDocument,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agent', 'application'] });
      toast.success('Document deleted.');
    },
    onError: (err) => toast.error(err.message || 'Could not delete document'),
  });
}