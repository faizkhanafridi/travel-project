import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import FullPageLoader from '../ui/FullPageLoader';

import { useEffect } from 'react';

// Once a user is authenticated, these routes must never render — regardless
// of how they got here (back button, deep link, refresh, etc.).
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
    // Replace — this deletes the pre-auth entry from browser history.
    navigate(target, { replace: true });
  }, [blocked, navigate, user]);

  if (blocked) return <FullPageLoader label="Redirecting…" />;
  return children;
}


// Blocks unauthenticated access. Redirects to login preserving intended destination.
export function ProtectedRoute({ children }) {
  const { user, isLoading, requiresMfa } = useAuthStore();
  const location = useLocation();

  if (isLoading) return <FullPageLoader />;
  if (requiresMfa) return <Navigate to="/mfa/verify" replace />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  return children;
}

// For login/register/forgot/reset — sends authenticated users onward.
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

// Only accessible when authenticated but onboarding is NOT yet completed.
export function OnboardingRoute({ children }) {
  const { user, isLoading, requiresMfa } = useAuthStore();

  if (isLoading) return <FullPageLoader />;
  if (requiresMfa) return <Navigate to="/mfa/verify" replace />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.onboarding_completed) return <Navigate to="/" replace />;

  return children;
}