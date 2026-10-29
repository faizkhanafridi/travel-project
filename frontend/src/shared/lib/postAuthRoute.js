// Determines where a user lands after authentication.
// Rules locked by spec:
// - Not verified → verify email (though verified guard normally blocks this)
// - Not onboarded → choose role page
// - Onboarded → home
// - Approved agents are handled via /auth/me -> roles include 'agent'
export function resolvePostAuthRoute(user) {
  if (!user) return '/login';
  if (!user.email_verified_at) return '/verify-email';
  if (!user.onboarding_completed) return '/onboarding/choose-role';
  return '/';
}