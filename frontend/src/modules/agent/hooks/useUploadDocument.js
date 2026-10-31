import { useMutation, useQueryClient } from '@tanstack/react-query';
import { agentService } from '../services/agentService';
import { toast } from '../../../shared/components/Toast';

export function useUploadDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: agentService.uploadDocument,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['agent', 'application'] });
      toast.success('Document uploaded.');
    },
    onError: (err) => {
      const e = err?.errors && Object.values(err.errors)[0]?.[0];
      toast.error(e || err.message || 'Upload failed');
    },
  });
}