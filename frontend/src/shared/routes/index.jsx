import { createBrowserRouter, Navigate } from 'react-router-dom';

import AuthLayout from '../layouts/AuthLayout';
import AppLayout from '../layouts/AppLayout';
import GuestOnly from './GuestOnly';
import AuthOnly from './AuthOnly';

import LoginPage from '../../modules/auth/pages/LoginPage';
import RegisterPage from '../../modules/auth/pages/RegisterPage';
import VerifyEmailPage from '../../modules/auth/pages/VerifyEmailPage';
import ForgotPasswordPage from '../../modules/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '../../modules/auth/pages/ResetPasswordPage';
import ChangePasswordPage from '../../modules/auth/pages/ChangePasswordPage';
import ChooseRolePage from '../../modules/auth/pages/ChooseRolePage';
import SocialCallbackPage from '../../modules/auth/pages/SocialCallbackPage';

import HomePage from '../pages/HomePage';
import ComingSoonPage from '../pages/ComingSoonPage';
import NotFoundPage from '../pages/NotFoundPage';

export const router = createBrowserRouter([
  // Guest-only auth pages
  {
    element: <GuestOnly />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
          { path: '/verify-email', element: <VerifyEmailPage /> },
          { path: '/forgot-password', element: <ForgotPasswordPage /> },
          { path: '/reset-password', element: <ResetPasswordPage /> },
        ],
      },
    ],
  },

  // Social callback — no guard, page handles redirect after fetching /auth/me
  { path: '/auth/social/callback', element: <SocialCallbackPage /> },

  // Authenticated routes
  {
    element: <AuthOnly />,
    children: [
      { path: '/onboarding/choose-role', element: <ChooseRolePage /> },
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <HomePage /> },
          { path: '/change-password', element: <ChangePasswordPage /> },
          {
            path: '/profile-setup',
            element: <ComingSoonPage title="Profile setup — Module 02" />,
          },
          {
            path: '/become-agent',
            element: <ComingSoonPage title="Become an Agent — Module 03" />,
          },
        ],
      },
    ],
  },

  { path: '/404', element: <NotFoundPage /> },
  { path: '*', element: <Navigate to="/404" replace /> },
]);