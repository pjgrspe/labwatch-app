// labwatch-app/app/auth/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="login" options={{ title: 'Login', headerShown: false }} />
      {/* Add other auth screens here if needed, e.g., register, forgot-password */}
      {/* <Stack.Screen name="register" options={{ title: 'Register' }} /> */}
    </Stack>
  );
}