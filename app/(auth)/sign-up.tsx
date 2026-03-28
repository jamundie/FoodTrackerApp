import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/hooks/AuthContext';
import { authStyles as s } from '@/styles/auth.styles';

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password || !confirm) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setError(null);
    setLoading(true);
    const { error } = await signUp(email.trim(), password);
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <View style={[s.container, { justifyContent: 'center' }]}>
        <View style={s.card}>
          <Text style={s.title}>Check your email</Text>
          <Text style={[s.subtitle, { marginBottom: 0 }]}>
            We sent a confirmation link to{'\n'}<Text style={{ fontWeight: '600', color: '#333' }}>{email}</Text>
            {'\n\n'}Once confirmed, sign in below.
          </Text>
        </View>
        <View style={s.switchRow}>
          <TouchableOpacity onPress={() => router.replace('/(auth)/sign-in')}>
            <Text style={s.switchLink}>Back to Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <View style={s.logoContainer}>
          <Text style={s.appName}>FoodTracker</Text>
          <Text style={s.tagline}>Your personal health companion</Text>
        </View>

        <View style={s.card}>
          <Text style={s.title}>Create account</Text>
          <Text style={s.subtitle}>Free forever, no credit card needed</Text>

          {error && (
            <View style={s.errorBox}>
              <Text style={s.errorText}>{error}</Text>
            </View>
          )}

          <Text style={s.fieldLabel}>Email</Text>
          <TextInput
            style={[s.input, emailFocused && s.inputFocused]}
            value={email}
            onChangeText={setEmail}
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
            placeholder="you@example.com"
            placeholderTextColor="#aaa"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            textContentType="emailAddress"
          />

          <Text style={s.fieldLabel}>Password</Text>
          <TextInput
            style={[s.input, passwordFocused && s.inputFocused]}
            value={password}
            onChangeText={setPassword}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
            placeholder="Minimum 8 characters"
            placeholderTextColor="#aaa"
            secureTextEntry
            textContentType="newPassword"
          />

          <Text style={s.fieldLabel}>Confirm Password</Text>
          <TextInput
            style={[s.input, confirmFocused && s.inputFocused]}
            value={confirm}
            onChangeText={setConfirm}
            onFocus={() => setConfirmFocused(true)}
            onBlur={() => setConfirmFocused(false)}
            placeholder="Re-enter password"
            placeholderTextColor="#aaa"
            secureTextEntry
            textContentType="newPassword"
          />

          <TouchableOpacity
            style={[s.primaryButton, loading && s.primaryButtonDisabled]}
            onPress={handleSignUp}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.primaryButtonText}>Create Account</Text>
            }
          </TouchableOpacity>
        </View>

        <View style={s.switchRow}>
          <Text style={s.switchText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/sign-in')}>
            <Text style={s.switchLink}> Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
