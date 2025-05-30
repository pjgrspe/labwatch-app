// labwatch-app/app/auth/_layout.tsx
// This layout can remain simple as it's just for grouping auth screens,
// and the root layout will apply modal presentation if needed.
// If auth screens need their own distinct header style not covered by root,
// you'd use getCommonHeaderOptions here.
import { Stack } from 'expo-router';
import React from 'react';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="denied" />
      <Stack.Screen name="pending-approval" />
       {/* index.tsx in auth will redirect, so no explicit options needed */}
      <Stack.Screen name="index" />
    </Stack>
  );
}