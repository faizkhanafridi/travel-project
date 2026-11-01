import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { agentService } from '../services/agentService';

const wizardKey = ['agent', 'wizard'];
const accountKey = ['agent', 'account'];

export function useAgentWizard() {
  return useQuery({
    queryKey: wizardKey,
    queryFn: agentService.wizard,
    staleTime: 15_000,
  });
}

export function useAgentAccount() {
  return useQuery({
    queryKey: accountKey,
    queryFn: agentService.account,
    staleTime: 15_000,
  });
}

function useWizardMutation(mutationFn) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (data) => {
      qc.setQueryData(wizardKey, data);
    },
  });
}

export const useSaveAgency = () => useWizardMutation(agentService.saveAgency);
export const useSaveBusiness = () => useWizardMutation(agentService.saveBusiness);
export const useUploadDocuments = () => useWizardMutation(agentService.uploadDocuments);
export const useSaveHours = () => useWizardMutation(agentService.saveHours);
export const useSubmitAgent = () => useWizardMutation(agentService.submit);

function useAccountMutation(mutationFn) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (data) => {
      qc.setQueryData(accountKey, data);
    },
  });
}

export const useUpdateAgency = () => useAccountMutation(agentService.updateAgency);
export const useUpdateBusiness = () => useAccountMutation(agentService.updateBusiness);
export const useUpdateHours = () => useAccountMutation(agentService.updateHours);

export function usePublicAgents(params) {
  return useQuery({
    queryKey: ['agent', 'public', params],
    queryFn: () => agentService.publicList(params),
  });
}

export function usePublicAgent(uuid) {
  return useQuery({
    queryKey: ['agent', 'public', uuid],
    queryFn: () => agentService.publicShow(uuid),
    enabled: !!uuid,
  });
}

export function useAdminAgents(params) {
  return useQuery({
    queryKey: ['agent', 'admin', params],
    queryFn: () => agentService.adminList(params),
  });
}

export function useAdminAgent(uuid) {
  return useQuery({
    queryKey: ['agent', 'admin', uuid],
    queryFn: () => agentService.adminShow(uuid),
    enabled: !!uuid,
  });
}

// Per-action loading — the caller passes `action` so only one button spins.
export function useAdminAgentAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ action, uuid, reason }) => {
      if (action === 'approve') return agentService.adminApprove(uuid);
      if (action === 'reject') return agentService.adminReject(uuid, reason);
      return agentService.adminMarkUnderReview(uuid);
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['agent', 'admin'] });
      if (data?.data?.uuid) {
        qc.setQueryData(['agent', 'admin', data.data.uuid], data);
      }
    },
  });
}