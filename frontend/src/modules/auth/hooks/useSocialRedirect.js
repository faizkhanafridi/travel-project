import { useCallback, useState } from 'react';
import { authService } from '../services/authService';

export function useSocialRedirect() {
  const [isLoading, setLoading] = useState(false);

  const redirect = useCallback((provider) => {
    setLoading(true);
    // Full page navigation to backend Socialite redirect endpoint.
    window.location.href = authService.socialRedirectUrl(provider);
  }, []);

  return { redirect, isLoading };
}