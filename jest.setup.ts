// Jest setup file to mock components that cause async state updates
import React from 'react';

// ── Supabase + auth mocks (must come first — many modules import these) ──────

// Prevent lib/supabase.ts from throwing on missing env vars in test environment
jest.mock('./lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
      signUp: jest.fn().mockResolvedValue({ error: null }),
      signInWithPassword: jest.fn().mockResolvedValue({ error: null }),
      signOut: jest.fn().mockResolvedValue({}),
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockResolvedValue({ error: null }),
      upsert: jest.fn().mockResolvedValue({ error: null }),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: [], error: null }),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    }),
    storage: {
      from: jest.fn().mockReturnValue({
        upload: jest.fn().mockResolvedValue({ error: null }),
        createSignedUrl: jest.fn().mockResolvedValue({ data: { signedUrl: 'https://mock.url/photo.jpg' }, error: null }),
      }),
    },
  },
}));

// Mock trackingService globally so no real Supabase calls occur in any test
jest.mock('./lib/trackingService', () => ({
  fetchFoodEntries: jest.fn().mockResolvedValue([]),
  fetchWaterEntries: jest.fn().mockResolvedValue([]),
  fetchBowelEntries: jest.fn().mockResolvedValue([]),
  fetchUserProfile: jest.fn().mockResolvedValue(null),
  insertFoodEntry: jest.fn().mockResolvedValue(undefined),
  insertWaterEntry: jest.fn().mockResolvedValue(undefined),
  insertBowelEntry: jest.fn().mockResolvedValue(undefined),
  upsertUserProfile: jest.fn().mockResolvedValue(undefined),
  uploadPhoto: jest.fn().mockResolvedValue(null),
  getDecryptedPhotoUri: jest.fn().mockResolvedValue('file:///mock/decrypted-photo.jpg'),
}));

// Mock AuthContext globally so any test rendering TrackingProvider works without an AuthProvider
jest.mock('./hooks/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'test-user-id', email: 'test@example.com' }, session: null, loading: false }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock expo-secure-store (native module — not available in Jest)
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue(null),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

// Mock expo-image-picker to avoid native module errors in tests
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  launchImageLibraryAsync: jest.fn().mockResolvedValue({ canceled: true, assets: [] }),
  launchCameraAsync: jest.fn().mockResolvedValue({ canceled: true, assets: [] }),
}));

// Mock Ionicons to prevent async state updates in tests
jest.mock('@expo/vector-icons/Ionicons', () => {
  const { Text } = require('react-native');
  const mockReact = require('react');
  return (props: any) => mockReact.createElement(Text, { testID: 'mocked-icon', ...props }, props.name || 'icon');
});

// Mock React Native Skia components for tests
jest.mock('@shopify/react-native-skia', () => {
  const React = require('react');
  const { View } = require('react-native');
  
  const MockCanvas = ({ children, style, ...props }: any) => {
    return React.createElement(View, { 
      testID: 'mocked-canvas', 
      style: style,
      ...props 
    }, children);
  };
  
  const MockLine = (props: any) => {
    return React.createElement(View, { 
      testID: 'mocked-line', 
      style: { width: 1, height: 1 },
      ...props 
    });
  };
  
  const MockCircle = (props: any) => {
    return React.createElement(View, { 
      testID: 'mocked-circle', 
      style: { width: 1, height: 1 },
      ...props 
    });
  };
  
  const MockRect = (props: any) => {
    return React.createElement(View, { 
      testID: 'mocked-rect', 
      style: { width: 1, height: 1 },
      ...props 
    });
  };
  
  return {
    Canvas: MockCanvas,
    Line: MockLine,
    Circle: MockCircle,
    Rect: MockRect,
  };
});

// Silence act() warnings for tests that can't easily be wrapped
const originalError = console.error;
console.error = (...args: any[]) => {
  // Suppress the specific act() warning for Icon components
  if (
    typeof args[0] === 'string' &&
    args[0].includes('An update to Icon inside a test was not wrapped in act')
  ) {
    return;
  }
  
  // Allow Skia errors through to debug
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('React.jsx: type is invalid') || 
     args[0].includes('Element type is invalid'))
  ) {
    originalError.call(console, ...args);
    return;
  }
  
  originalError.call(console, ...args);
};