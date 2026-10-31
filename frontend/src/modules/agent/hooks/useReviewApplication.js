import { useQuery } from '@tanstack/react-query';
import { agentService } from '../services/agentService';

export function useReviewApplication({ enabled = false } = {}) {
  return useQuery({
    queryKey: ['agent', 'application', 'review'],
    queryFn: agentService.getReview,
    enabled,
    retry: false,
    staleTime: 0,
  });
}