import { createBrowserRouter, Navigate } from "react-router-dom";

// PUBLIC PAGES
import HomePage from "../pages/HomePage";
import ComingSoonPage from "../pages/ComingSoonPage";
import NotFoundPage from "../pages/NotFoundPage";

// MODULE  SHARED LAYOUTS
import AuthLayout from "../layouts/AuthLayout";
import AppLayout from "../layouts/AppLayout";
import GuestOnly from "./GuestOnly";
import AuthOnly from "./AuthOnly";

// MODULE  01    AUTHENTICATION
import LoginPage from "../../modules/auth/pages/LoginPage";
import RegisterPage from "../../modules/auth/pages/RegisterPage";
import VerifyEmailPage from "../../modules/auth/pages/VerifyEmailPage";
import ForgotPasswordPage from "../../modules/auth/pages/ForgotPasswordPage";
import ResetPasswordPage from "../../modules/auth/pages/ResetPasswordPage";
import ChangePasswordPage from "../../modules/auth/pages/ChangePasswordPage";
import SetPasswordPage from "../../modules/auth/pages/SetPasswordPage";
import SetPasswordAccountPage from '../../modules/auth/pages/SetPasswordAccountPage';

import ChooseRolePage from "../../modules/auth/pages/ChooseRolePage";
import SocialCallbackPage from "../../modules/auth/pages/SocialCallbackPage";

// MODULE  02    USER-Profile
import ProfileSetupPage from "../../modules/profile/pages/ProfileSetupPage";
import MyProfilePage from "../../modules/profile/pages/MyProfilePage";
import PublicProfilePage from "../../modules/profile/pages/PublicProfilePage";
export const router = createBrowserRouter([
  // Guest-only auth pages
  {
    element: <GuestOnly />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "/login", element: <LoginPage /> },
          { path: "/register", element: <RegisterPage /> },
          { path: "/verify-email", element: <VerifyEmailPage /> },
          { path: "/forgot-password", element: <ForgotPasswordPage /> },
          { path: "/reset-password", element: <ResetPasswordPage /> },
          { path: '/set-password', element: <SetPasswordPage /> },

        ],
      },
    ],
  },

  // Social callback — no guard, page handles redirect after fetching /auth/me
  { path: "/auth/social/callback", element: <SocialCallbackPage /> },

  // Authenticated routes
  {
    element: <AuthOnly />,
    children: [
      { path: "/onboarding/choose-role", element: <ChooseRolePage /> },
      {
        element: <AppLayout />,
        children: [

          // MODULE  01    AUTHENTICATION
          { path: "/", element: <HomePage /> },
          { path: "/change-password", element: <ChangePasswordPage /> },
          { path: '/set-password-account', element: <SetPasswordAccountPage /> }, 

          // MODULE  02    USER-Profile
          { path: "/", element: <HomePage /> },
          { path: "/profile", element: <MyProfilePage /> },
          { path: "/profile-setup", element: <ProfileSetupPage /> },
          { path: "/u/:username", element: <PublicProfilePage /> },
          {
            path: "/become-agent",
            element: <ComingSoonPage title="Become an Agent — Module 03" />,
          },
        ],
      },
    ],
  },

  { path: "/404", element: <NotFoundPage /> },
  { path: "*", element: <Navigate to="/404" replace /> },
]);
