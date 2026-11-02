import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceService } from '../services/serviceService';
import { useCurrencyStore } from '../stores/currencyStore';

const wizardKey = (uuid) => ['service', 'wizard', uuid];
const mineKey = (params) => ['service', 'mine', params];
const publicKey = (params) => ['service', 'public', params];

export function useCategories() {
  return useQuery({
    queryKey: ['service', 'categories'],
    queryFn: serviceService.categories,
    staleTime: 5 * 60_000,
  });
}

export function useNavigation() {
  return useQuery({
    queryKey: ['service', 'navigation'],
    queryFn: serviceService.navigation,
    staleTime: 5 * 60_000,
  });
}

export function useCurrencyRates() {
  return useQuery({
    queryKey: ['service', 'currency-rates'],
    queryFn: serviceService.currencyRates,
    staleTime: 6 * 60 * 60_000,
  });
}

export function useMyServices(params) {
  return useQuery({
    queryKey: mineKey(params),
    queryFn: () => serviceService.mine(params),
  });
}

export function useCreateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: serviceService.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['service', 'mine'] }),
  });
}

export function useService(uuid) {
  return useQuery({
    queryKey: wizardKey(uuid),
    queryFn: () => serviceService.show(uuid),
    enabled: !!uuid,
  });
}

function useWizardMutation(uuid, fn) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => fn(uuid, payload),
    onSuccess: (data) => {
      qc.setQueryData(wizardKey(uuid), data);
      qc.invalidateQueries({ queryKey: ['service', 'mine'] });
    },
  });
}

export const useSaveBasic = (uuid) =>
  useWizardMutation(uuid, serviceService.saveBasic);
export const useSaveDetails = (uuid) =>
  useWizardMutation(uuid, serviceService.saveDetails);
export const useUploadGallery = (uuid) =>
  useWizardMutation(uuid, serviceService.uploadGallery);
export const useReorderGallery = (uuid) =>
  useWizardMutation(uuid, serviceService.reorderGallery);
export const useDeleteImage = (uuid) =>
  useWizardMutation(uuid, (u, imgUuid) => serviceService.deleteImage(u, imgUuid));
export const useSaveRequirements = (uuid) =>
  useWizardMutation(uuid, serviceService.saveRequirements);
export const useSubmitService = (uuid) =>
  useWizardMutation(uuid, (_uuid) => serviceService.submit(uuid));
export const useRequestRepublish = (uuid) =>
  useWizardMutation(uuid, (u, reason) => serviceService.requestRepublish(u, reason));

export function useDestroyService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: serviceService.destroy,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['service', 'mine'] }),
  });
}

export function usePublicServices(params) {
  const currency = useCurrencyStore((s) => s.currency);
  return useQuery({
    queryKey: [...publicKey(params), currency],
    queryFn: () => serviceService.publicList({ ...params, currency }),
  });
}

export function usePublicService(uuid) {
  const currency = useCurrencyStore((s) => s.currency);
  return useQuery({
    queryKey: ['service', 'public', uuid, currency],
    queryFn: () => serviceService.publicShow(uuid, { currency }),
    enabled: !!uuid,
  });
}

export function useAdminServices(params) {
  return useQuery({
    queryKey: ['service', 'admin', params],
    queryFn: () => serviceService.adminList(params),
  });
}

export function useAdminService(uuid) {
  return useQuery({
    queryKey: ['service', 'admin', uuid],
    queryFn: () => serviceService.adminShow(uuid),
    enabled: !!uuid,
  });
}

export function useAdminServiceAction(uuid) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ action, reason, republishUuid }) => {
      switch (action) {
        case 'under_review': return serviceService.adminMarkUnderReview(uuid);
        case 'approve': return serviceService.adminApprove(uuid);
        case 'reject': return serviceService.adminReject(uuid, reason);
        case 'unpublish': return serviceService.adminUnpublish(uuid);
        case 'suspend': return serviceService.adminSuspend(uuid);
        case 'unsuspend': return serviceService.adminUnsuspend(uuid);
        case 'approve_republish':
          return serviceService.adminApproveRepublish(republishUuid);
        case 'reject_republish':
          return serviceService.adminRejectRepublish(republishUuid, reason);
        default:
          throw new Error('Unknown action');
      }
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['service', 'admin'] });
      if (data?.data?.uuid) {
        qc.setQueryData(['service', 'admin', data.data.uuid], data);
      }
    },
  });
}