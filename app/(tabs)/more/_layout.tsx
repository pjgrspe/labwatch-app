// labwatch-app/app/(tabs)/more/_layout.tsx
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Stack } from 'expo-router';
import React from 'react';

export default function MoreLayout() {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors[colorScheme].headerBackground,
        },
        headerTintColor: Colors[colorScheme].headerTint,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Stack.Screen name="index" options={{ title: 'More Options' }} />
      <Stack.Screen name="protocols" options={{ title: 'Emergency Protocols' }} />
      <Stack.Screen name="incidents" options={{ title: 'Incident History' }} />
      <Stack.Screen name="knowledge-base" options={{ title: 'Knowledge Base' }} />
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />
    </Stack>
  );
}