import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import Spinner from '../components/Spinner';
import { resolvePostAuthRoute } from '../lib/postAuthRoute';

export default function GuestOnly() {
  const { user, ready } = useAuthStore();
  if (!ready) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Spinner size={28} />
      </div>
    );
  }
  if (user) return <Navigate to={resolvePostAuthRoute(user)} replace />;
  return <Outlet />;
}