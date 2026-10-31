import { useQuery } from '@tanstack/react-query';
import { adminAgentService } from '../../services/adminAgentService';

export function useAdminAgents({ status, search, page = 1 } = {}) {
  return useQuery({
    queryKey: ['admin', 'agents', { status, search, page }],
    queryFn: () => adminAgentService.list({ status, search, page }),
    staleTime: 30 * 1000,
  });
}