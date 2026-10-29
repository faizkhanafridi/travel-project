import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { authService } from '../services/authService';
import useAuthStore from '../../../shared/stores/authStore';

export function useCurrentUser() {
  const { setUser, clearUser, setReady } = useAuthStore();

  const query = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: authService.me,
    retry: false,
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    if (query.isSuccess) {
      setUser(query.data?.data || null);
    }
    if (query.isError) {
      clearUser();
      setReady(true);
    }
  }, [query.isSuccess, query.isError, query.data, setUser, clearUser, setReady]);

  return query;
}