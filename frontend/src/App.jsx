import { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AOS from 'aos';
import 'aos/dist/aos.css';

import {
  PostAuthLock,
  ProtectedRoute,
  GuestRoute,
  OnboardingRoute,
} from './components/layout/RouteGuards';

import { useAuthStore } from './stores/authStore';
import { authService } from './modules/auth/services/authService';

import HomePage from './pages/HomePage';
import BecomeAgentPlaceholder from './pages/BecomeAgentPlaceholder';
import NotFoundPage from './pages/NotFoundPage';

import RegisterPage from './modules/auth/pages/RegisterPage';
import VerifyEmailPage from './modules/auth/pages/VerifyEmailPage';
import LoginPage from './modules/auth/pages/LoginPage';
import ForgotPasswordPage from './modules/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from './modules/auth/pages/ResetPasswordPage';
import SetPasswordPage from './modules/auth/pages/SetPasswordPage';
import MfaChallengePage from './modules/auth/pages/MfaChallengePage';
import OnboardingPage from './modules/auth/pages/OnboardingPage';
import SocialSuccessPage from './modules/auth/pages/SocialSuccessPage';
import SocialErrorPage from './modules/auth/pages/SocialErrorPage';
import EmailChangeConfirmPage from './modules/user-profile/pages/EmailChangeConfirmPage';
import PublicProfilePage from './modules/user-profile/pages/PublicProfilePage';
import MyProfilePage from './modules/user-profile/pages/MyProfilePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
  },
});

function AuthBootstrap() {
  const { setUser, clearUser, setRequiresMfa, setLoading } = useAuthStore();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    (async () => {
      try {
        const result = await authService.me();
        if (result?.requires_mfa) setRequiresMfa();
        else setUser(result.data);
      } catch {
        clearUser();
        setLoading(false);
      }
    })();
  }, [setUser, clearUser, setRequiresMfa, setLoading]);

  return null;
}


function PublicHome() {
  return <HomePage />;
}

export default function App() {
  useEffect(() => {
    AOS.init({
      once: true,
      duration: 600,
      easing: 'ease-out-cubic',
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthBootstrap />

        <Routes>
          {/* Pre-authentication routes */}
          <Route
            path="*"
            element={
              <PostAuthLock>
                <Routes>
                  <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
                  <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
                  <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
                  <Route path="/reset-password" element={<GuestRoute><ResetPasswordPage /></GuestRoute>} />
                  <Route path="/set-password" element={<GuestRoute><SetPasswordPage /></GuestRoute>} />

                  <Route path="/verify-email" element={<VerifyEmailPage />} />
                  <Route path="/mfa/verify" element={<MfaChallengePage />} />

                  <Route path="/auth/social/success" element={<SocialSuccessPage />} />
                  <Route path="/auth/social/error" element={<SocialErrorPage />} />

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </PostAuthLock>
            }
          />

          {/* Authenticated routes */}
           <Route
            path="/onboarding"
            element={
              <OnboardingRoute>
                <OnboardingPage />
              </OnboardingRoute>
            }
          />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <PublicHome />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <MyProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/u/:uuid"
            element={
             
                <PublicProfilePage />
           
            }
          />

          <Route
            path="/account/email/confirm-current"
            element={
              <ProtectedRoute>
                <EmailChangeConfirmPage stage="CURRENT_EMAIL_VERIFY" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/account/email/confirm-new"
            element={
              <ProtectedRoute>
                <EmailChangeConfirmPage stage="NEW_EMAIL_VERIFY" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/become-agent"
            element={
              <ProtectedRoute>
                <BecomeAgentPlaceholder />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}