import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import Spinner from '../components/Spinner';

export default function VerifiedOnly() {
  const { user, ready } = useAuthStore();
  if (!ready) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Spinner size={28} />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (!user.email_verified_at) return <Navigate to="/verify-email" replace />;
  return <Outlet />;
}