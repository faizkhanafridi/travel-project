import { api } from '../../../lib/api';

export const marketplaceService = {
  search: (params) =>
    api.get('/marketplace/', { params }).then((r) => r.data),
  filters: () =>
    api.get('/marketplace/filters').then((r) => r.data),
};