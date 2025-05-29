// labwatch-app/app/(tabs)/more/incidents/_layout.tsx
import { getCommonHeaderOptions } from '@/constants/NavigationOptions';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Stack } from 'expo-router';
import React from 'react';

export default function IncidentsStackLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const commonOptions = getCommonHeaderOptions(colorScheme);
  return (
    <Stack screenOptions={commonOptions}>
      <Stack.Screen name="index" options={{ title: 'Incident History' }} />
      {/* The title for [id] will be set in its component */}
      <Stack.Screen name="[id]" />
    </Stack>
  );
}