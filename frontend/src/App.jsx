import { useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AOS from "aos";
import "aos/dist/aos.css";

import {
  PostAuthLock,
  ProtectedRoute,
  GuestRoute,
  OnboardingRoute,
  AdminRoute,
} from "./components/layout/RouteGuards";

import { useAuthStore } from "./stores/authStore";
import { authService } from "./modules/auth/services/authService";

import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";

import RegisterPage from "./modules/auth/pages/RegisterPage";
import VerifyEmailPage from "./modules/auth/pages/VerifyEmailPage";
import LoginPage from "./modules/auth/pages/LoginPage";
import ForgotPasswordPage from "./modules/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "./modules/auth/pages/ResetPasswordPage";
import SetPasswordPage from "./modules/auth/pages/SetPasswordPage";
import MfaChallengePage from "./modules/auth/pages/MfaChallengePage";
import OnboardingPage from "./modules/auth/pages/OnboardingPage";
import SocialSuccessPage from "./modules/auth/pages/SocialSuccessPage";
import SocialErrorPage from "./modules/auth/pages/SocialErrorPage";
import EmailChangeConfirmPage from "./modules/user-profile/pages/EmailChangeConfirmPage";
import PublicProfilePage from "./modules/user-profile/pages/PublicProfilePage";
import MyProfilePage from "./modules/user-profile/pages/MyProfilePage";
import BecomeAgentPage from "./modules/agent/pages/BecomeAgentPage";
import AgentApplicationPage from "./modules/agent/pages/AgentApplicationPage";
import AdminAgentsPage from "./modules/agent/pages/admin/AdminAgentsPage";
import AdminAgentReviewPage from "./modules/agent/pages/admin/AdminAgentReviewPage";
import AgentAccountPage from "./modules/agent/pages/AgentAccountPage";
import PublicAgentPage from "./modules/agent/pages/PublicAgentPage";
import MyServicesPage from "./modules/travel-services/pages/MyServicesPage";
import ServiceWizardPage from "./modules/travel-services/pages/ServiceWizardPage";
import ServiceDetailPage from "./modules/travel-services/pages/ServiceDetailPage";
import AdminServicesPage from "./modules/travel-services/pages/admin/AdminServicesPage";
import AdminServiceReviewPage from "./modules/travel-services/pages/admin/AdminServiceReviewPage";
import MarketplacePage from "./modules/marketplace/pages/MarketplacePage";
import MessagingPage from "./modules/messaging/pages/MessagingPage";

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
      easing: "ease-out-cubic",
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
                  <Route
                    path="/register"
                    element={
                      <GuestRoute>
                        <RegisterPage />
                      </GuestRoute>
                    }
                  />
                  <Route
                    path="/login"
                    element={
                      <GuestRoute>
                        <LoginPage />
                      </GuestRoute>
                    }
                  />
                  <Route
                    path="/forgot-password"
                    element={
                      <GuestRoute>
                        <ForgotPasswordPage />
                      </GuestRoute>
                    }
                  />
                  <Route
                    path="/reset-password"
                    element={
                      <GuestRoute>
                        <ResetPasswordPage />
                      </GuestRoute>
                    }
                  />
                  <Route
                    path="/set-password"
                    element={
                      <GuestRoute>
                        <SetPasswordPage />
                      </GuestRoute>
                    }
                  />

                  <Route path="/verify-email" element={<VerifyEmailPage />} />
                  <Route path="/mfa/verify" element={<MfaChallengePage />} />

                  <Route
                    path="/auth/social/success"
                    element={<SocialSuccessPage />}
                  />
                  <Route
                    path="/auth/social/error"
                    element={<SocialErrorPage />}
                  />

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

          <Route path="/u/:uuid" element={<PublicProfilePage />} />

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
            path="/messages"
            element={
              <ProtectedRoute>
                <MessagingPage />
              </ProtectedRoute>
            }
          />

          {/* Agent */}
          <Route
            path="/become-agent"
            element={
              <ProtectedRoute>
                <BecomeAgentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/agent/apply"
            element={
              <ProtectedRoute>
                <AgentApplicationPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/agent/account"
            element={
              <ProtectedRoute>
                <AgentAccountPage />
              </ProtectedRoute>
            }
          />

          <Route path="/agency/:uuid" element={<PublicAgentPage />} />
          <Route path="/services/:uuid" element={<ServiceDetailPage />} />

          <Route
            path="/services/mine"
            element={
              <ProtectedRoute>
                <MyServicesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/services/mine/:uuid"
            element={
              <ProtectedRoute>
                <ServiceWizardPage />
              </ProtectedRoute>
            }
          />

          <Route path="/marketplace" element={<MarketplacePage />} />

          {/* Admin */}
          <Route
            path="/admin/agents"
            element={
              <AdminRoute>
                <AdminAgentsPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/agents/:uuid"
            element={
              <AdminRoute>
                <AdminAgentReviewPage />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/services"
            element={
              <AdminRoute>
                <AdminServicesPage />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/services/:uuid"
            element={
              <AdminRoute>
                <AdminServiceReviewPage />
              </AdminRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
