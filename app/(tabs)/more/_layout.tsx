// labwatch-app/app/(tabs)/more/_layout.tsx
import { getCommonHeaderOptions } from '@/constants/NavigationOptions'; // Import the new function
import { useColorScheme } from '@/hooks/useColorScheme';
import { Stack } from 'expo-router';
import React from 'react';

export default function MoreLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const commonOptions = getCommonHeaderOptions(colorScheme);

  return (
    <Stack screenOptions={commonOptions}>
      <Stack.Screen name="index" options={{ title: 'More Options' }} />
      <Stack.Screen name="protocols" options={{ headerShown: false }} />
      <Stack.Screen name="incidents" options={{ headerShown: false }} />
      {/* knowledge-base screen is commented out in index, so not adding header config unless restored */}
      {/* <Stack.Screen name="knowledge-base" options={{ title: 'Knowledge Base' }} /> */}
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      <Stack.Screen name="admin" options={{ headerShown: false }} />
    </Stack>
  );
}