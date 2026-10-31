import { useQuery } from '@tanstack/react-query';
import { agentService } from '../services/agentService';

export function useMyApplication() {
  return useQuery({
    queryKey: ['agent', 'application'],
    queryFn: agentService.getApplication,
    staleTime: 30 * 1000,
  });
}