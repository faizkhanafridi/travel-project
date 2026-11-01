// src/modules/auth/pages/SocialErrorPage.jsx
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import Button from '../../../components/ui/Button';

export default function SocialErrorPage() {
  const navigate = useNavigate();

  // Immediately rewrite the current history entry so the user cannot
  // press Back and land on /auth/social/error again.
  useEffect(() => {
    navigate('/login', { replace: true });
  }, [navigate]);

  // The component will unmount almost immediately; render a fallback in case
  // navigation is somehow blocked.
  return (
    <AuthLayout
      title="Sign-in failed"
      subtitle="We couldn't complete your social sign-in."
    >
      <div className="space-y-5 text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center">
          <XCircle className="w-6 h-6 text-rose-600" />
        </div>
        <p className="text-sm text-slate-500">
          Something went wrong while connecting to the provider. Please try again or
          use email login.
        </p>
        <div className="flex flex-col gap-2">
          <Link to="/login">
            <Button size="lg" className="w-full">
              Back to sign in
            </Button>
          </Link>
          <Link
            to="/register"
            className="text-sm font-semibold text-brand-700 hover:text-brand-800"
          >
            Create an account
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}