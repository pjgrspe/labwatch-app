// labwatch-app/app/(tabs)/rooms/_layout.tsx
import { getCommonHeaderOptions } from '@/constants/NavigationOptions';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Stack } from 'expo-router';
import React from 'react';

export default function RoomsStackLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const commonOptions = getCommonHeaderOptions(colorScheme);

  return (
    <Stack screenOptions={commonOptions}>
      <Stack.Screen name="index" options={{ title: 'Rooms' }} />
      <Stack.Screen name="archived" options={{ title: 'Archived Rooms' }} />
      {/* The title for [roomId] will be set in its component */}
      <Stack.Screen name="[roomId]" />
    </Stack>
  );
}