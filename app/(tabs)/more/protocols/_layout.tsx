// labwatch-app/app/(tabs)/more/protocols/_layout.tsx
import { getCommonHeaderOptions } from '@/constants/NavigationOptions';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Stack } from 'expo-router';
import React from 'react';

export default function ProtocolsStackLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const commonOptions = getCommonHeaderOptions(colorScheme);
  return (
    <Stack screenOptions={commonOptions}>
      <Stack.Screen name="index" options={{ title: 'Emergency Protocols' }} />
      {/* The title for [id] will be set in its component */}
      <Stack.Screen name="[id]" />
    </Stack>
  );
}