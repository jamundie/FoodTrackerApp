import React from 'react';
import { Stack } from 'expo-router';

// Auth screens share a common stack with no header chrome
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
