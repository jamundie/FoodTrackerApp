const SIGNUP_DISABLED_MESSAGE =
  'Sign-ups are closed. This app is invite-only, so please contact the app owner to have an account created for you.';

/** Supabase returns a generic "Signups not allowed" error when registration is disabled; swap it for an actionable message. */
export function signUpErrorMessage(error: { message: string; code?: string }): string {
  if (error.code === 'signup_disabled' || /signups? not allowed/i.test(error.message)) {
    return SIGNUP_DISABLED_MESSAGE;
  }
  return error.message;
}
