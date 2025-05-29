// labwatch-app/app/(tabs)/alerts/_layout.tsx
import { getCommonHeaderOptions } from '@/constants/NavigationOptions';
import { useColorScheme } from '@/hooks';
import { Stack } from 'expo-router';
import React from 'react';

export default function AlertsStackLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const commonOptions = getCommonHeaderOptions(colorScheme);

  return (
    <Stack screenOptions={commonOptions}>
      <Stack.Screen name="index" options={{ title: 'Alerts' }} />
      {/* The title for [id] will be set in its component */}
      <Stack.Screen name="[id]" />
    </Stack>
  );
}