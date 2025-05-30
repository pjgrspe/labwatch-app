// labwatch-app/app/(tabs)/incidents/_layout.tsx
import { getCommonHeaderOptions } from '@/constants/NavigationOptions';
import { useColorScheme } from '@/hooks';
import { Stack } from 'expo-router';
import React from 'react';

export default function IncidentsStackLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const commonOptions = getCommonHeaderOptions(colorScheme);
  return (
    <Stack screenOptions={commonOptions}>
      <Stack.Screen name="index" options={{ title: 'Incident History' }} />
      {/* The title for [id] will be set in the app/incident-details/[id].tsx component */}
      {/* Ensure your global incident details screen is correctly routed if not placed here */}
      {/* Example: <Stack.Screen name="../../incident-details/[id]" /> if it's outside this stack */}
    </Stack>
  );
}