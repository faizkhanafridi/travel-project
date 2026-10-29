import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import AOS from 'aos';
import 'aos/dist/aos.css';

import { router } from './shared/routes';
import queryClient from './shared/lib/queryClient';
import Toaster from './shared/components/Toast';
import { useCurrentUser } from './modules/auth/hooks/useCurrentUser';

function AuthBootstrapper() {
  // Hydrates the auth store from /auth/me on app boot (Sanctum cookie session).
  useCurrentUser();
  return null;
}

export default function App() {
  useEffect(() => {
    AOS.init({ duration: 500, once: true, offset: 20 });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthBootstrapper />
      <RouterProvider router={router} />
      <Toaster />
    </QueryClientProvider>
  );
}