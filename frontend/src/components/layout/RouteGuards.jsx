import { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import FullPageLoader from '../ui/FullPageLoader';

const PRE_AUTH_PATHS = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/set-password',
  '/verify-email',
  '/mfa/verify',
  '/auth/social/success',
  '/auth/social/error',
];

export function ProtectedRoute({ children }) {
  const { user, isLoading, requiresMfa } = useAuthStore();
  const location = useLocation();
  if (isLoading) return <FullPageLoader />;
  if (requiresMfa) return <Navigate to="/mfa/verify" replace />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

export function GuestRoute({ children }) {
  const { user, isLoading, requiresMfa } = useAuthStore();
  if (isLoading) return <FullPageLoader />;
  if (requiresMfa) return <Navigate to="/mfa/verify" replace />;
  if (user) {
    if (!user.onboarding_completed) return <Navigate to="/onboarding" replace />;
    return <Navigate to="/" replace />;
  }
  return children;
}

export function OnboardingRoute({ children }) {
  const { user, isLoading, requiresMfa } = useAuthStore();
  if (isLoading) return <FullPageLoader />;
  if (requiresMfa) return <Navigate to="/mfa/verify" replace />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.onboarding_completed) return <Navigate to="/" replace />;
  return children;
}

export function AdminRoute({ children }) {
  const { user, isLoading, requiresMfa } = useAuthStore();
  const location = useLocation();
  if (isLoading) return <FullPageLoader />;
  if (requiresMfa) return <Navigate to="/mfa/verify" replace />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (!user.is_super_admin) return <Navigate to="/" replace />;
  return children;
}

export function PostAuthLock({ children }) {
  const { user, isLoading, requiresMfa } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const blocked =
    !isLoading &&
    !requiresMfa &&
    user &&
    PRE_AUTH_PATHS.includes(location.pathname);

  useEffect(() => {
    if (!blocked) return;
    const target = user.onboarding_completed ? '/' : '/onboarding';
    navigate(target, { replace: true });
  }, [blocked, navigate, user]);

  if (blocked) return <FullPageLoader label="Redirecting…" />;
  return children;
}