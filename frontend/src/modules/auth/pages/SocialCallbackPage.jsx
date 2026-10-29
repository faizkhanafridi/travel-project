import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/authService';
import useAuthStore from '../../../shared/stores/authStore';
import Spinner from '../../../shared/components/Spinner';
import { resolvePostAuthRoute } from '../../../shared/lib/postAuthRoute';

export default function SocialCallbackPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await authService.me();
        if (cancelled) return;
        setUser(res.data);
        qc.setQueryData(['auth', 'me'], res);
        navigate(resolvePostAuthRoute(res.data), { replace: true });
      } catch {
        if (!cancelled) navigate('/login', { replace: true });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate, qc, setUser]);

  return (
    <div className="min-h-screen grid place-items-center">
      <div className="text-center">
        <Spinner size={32} />
        <p className="mt-3 text-sm text-ink-600">Signing you in…</p>
      </div>
    </div>
  );
}