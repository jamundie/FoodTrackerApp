import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SignUpScreen from '../../../app/(auth)/sign-up';

const mockSignUp = jest.fn();

jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }));
jest.mock('@/hooks/AuthContext', () => ({ useAuth: () => ({ signUp: mockSignUp }) }));

describe('SignUpScreen', () => {
  beforeEach(() => mockSignUp.mockReset());

  it('shows the invite-only message when sign-ups are disabled', async () => {
    mockSignUp.mockResolvedValue({ error: { message: 'Signups not allowed for this instance', code: 'signup_disabled' } });
    const { getByPlaceholderText, getByText, findByText } = render(<SignUpScreen />);

    fireEvent.changeText(getByPlaceholderText('you@example.com'), 'a@b.com');
    fireEvent.changeText(getByPlaceholderText('Minimum 8 characters'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Re-enter password'), 'password123');
    fireEvent.press(getByText('Create Account'));

    expect(await findByText(/contact the app owner to have an account created/i)).toBeTruthy();
  });

  it('shows the confirmation screen on success', async () => {
    mockSignUp.mockResolvedValue({ error: null });
    const { getByPlaceholderText, getByText } = render(<SignUpScreen />);

    fireEvent.changeText(getByPlaceholderText('you@example.com'), 'a@b.com');
    fireEvent.changeText(getByPlaceholderText('Minimum 8 characters'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Re-enter password'), 'password123');
    fireEvent.press(getByText('Create Account'));

    await waitFor(() => expect(getByText('Check your email')).toBeTruthy());
  });
});
