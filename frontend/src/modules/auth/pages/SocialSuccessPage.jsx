import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import FullPageLoader from '../../../components/ui/FullPageLoader';
import { authService } from '../services/authService';
import { useAuthStore } from '../../../stores/authStore';

export default function SocialSuccessPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const clearUser = useAuthStore((s) => s.clearUser);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    (async () => {
      try {
        const result = await authService.me();
        const user = result.data;
        setUser(user);

        // Social users with no password must set one before continuing.
        if (user.has_password === false) {
          const sent = sessionStorage.getItem('social_setpw_sent');
          if (!sent) {
            sessionStorage.setItem('social_setpw_sent', '1');
            await authService.forgotPassword({ email: user.email }).catch(() => {});
          }
          navigate(
            `/set-password?email=${encodeURIComponent(user.email)}&social=1`,
            { replace: true }
          );
          return;
        }

        if (!user.onboarding_completed) navigate('/onboarding', { replace: true });
        else navigate('/', { replace: true });
      } catch {
        clearUser();
        navigate('/login', { replace: true });
      }
    })();
  }, [navigate, setUser, clearUser]);

  return <FullPageLoader label="Signing you in…" />;
}