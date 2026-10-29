import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import Spinner from '../components/Spinner';

export default function AuthOnly() {
  const { user, ready } = useAuthStore();
  const location = useLocation();

  if (!ready) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Spinner size={28} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}