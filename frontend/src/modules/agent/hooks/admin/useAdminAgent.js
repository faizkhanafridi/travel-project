import { useQuery } from '@tanstack/react-query';
import { adminAgentService } from '../../services/adminAgentService';

export function useAdminAgent(uuid) {
  return useQuery({
    queryKey: ['admin', 'agents', uuid],
    queryFn: () => adminAgentService.show(uuid),
    enabled: !!uuid,
    staleTime: 15 * 1000,
  });
}