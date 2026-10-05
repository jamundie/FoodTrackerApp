import { signUpErrorMessage } from '../authErrors';

describe('signUpErrorMessage', () => {
  it('maps the signup_disabled code to the invite-only message', () => {
    expect(signUpErrorMessage({ message: 'Signups not allowed for this instance', code: 'signup_disabled' }))
      .toMatch(/invite-only.*contact the app owner/i);
  });

  it('maps the legacy message text when no code is present', () => {
    expect(signUpErrorMessage({ message: 'Signups not allowed for this instance' }))
      .toMatch(/contact the app owner/i);
  });

  it('passes other errors through unchanged', () => {
    expect(signUpErrorMessage({ message: 'User already registered', code: 'user_already_exists' }))
      .toBe('User already registered');
  });
});
