import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { travelPostService } from '../services/travelPostService';

export function useGlobalPosts(params) {
  const clean = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
  );
  return useQuery({
    queryKey: ['travel-posts', 'global', clean],
    queryFn: () => travelPostService.listGlobal(clean),
  });
}

export function useTravelPost(uuid) {
  return useQuery({
    queryKey: ['travel-posts', 'post', uuid],
    queryFn: () => travelPostService.showPost(uuid),
    enabled: !!uuid,
  });
}

export function useMyTravelPosts(params) {
  return useQuery({
    queryKey: ['travel-posts', 'my', params],
    queryFn: () => travelPostService.myPosts(params),
  });
}

export function usePostOffers(uuid) {
  return useQuery({
    queryKey: ['travel-posts', 'post', uuid, 'offers'],
    queryFn: () => travelPostService.postOffers(uuid),
    enabled: !!uuid,
  });
}

export function useMyOffers(params) {
  return useQuery({
    queryKey: ['travel-posts', 'my-offers', params],
    queryFn: () => travelPostService.myOffers(params),
  });
}

export function useAgentServiceRequests(params) {
  return useQuery({
    queryKey: ['travel-posts', 'agent-service-requests', params],
    queryFn: () => travelPostService.agentServiceRequests(params),
  });
}

export function useAgentServiceRequest(uuid) {
  return useQuery({
    queryKey: ['travel-posts', 'agent-service-request', uuid],
    queryFn: () => travelPostService.agentServiceRequest(uuid),
    enabled: !!uuid,
  });
}

export function useConnectPackages() {
  return useQuery({
    queryKey: ['connects', 'packages'],
    queryFn: travelPostService.connectPackages,
    staleTime: 60_000,
  });
}

export function useConnectBalance() {
  return useQuery({
    queryKey: ['connects', 'balance'],
    queryFn: travelPostService.connectBalance,
    staleTime: 30_000,
  });
}

export function useCreateGlobalPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: travelPostService.createGlobal,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['travel-posts'] }),
  });
}

export function useRequestTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ serviceUuid, payload }) =>
      travelPostService.requestTrip(serviceUuid, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['travel-posts'] }),
  });
}

export function useSubmitOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ postUuid, payload }) =>
      travelPostService.submitOffer(postUuid, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['travel-posts'] });
      qc.invalidateQueries({ queryKey: ['connects'] });
    },
  });
}

export function useWithdrawOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: travelPostService.withdrawOffer,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['travel-posts'] });
      qc.invalidateQueries({ queryKey: ['connects'] });
    },
  });
}

export function useDecideOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ uuid, decision }) => travelPostService.decideOffer(uuid, decision),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['travel-posts'] }),
  });
}

export function useCancelPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: travelPostService.cancelPost,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['travel-posts'] }),
  });
}

export function useBuyConnects() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: travelPostService.buyConnects,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['connects'] }),
  });
}