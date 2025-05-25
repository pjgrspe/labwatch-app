// labwatch-app/app/(tabs)/more/_layout.tsx
import { Colors } from '@/constants/Colors';
import Layout from '@/constants/Layout'; // Import Layout
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
          elevation: 0, // Remove shadow for a flatter look like the image
          shadowOpacity: 0, // Remove shadow for iOS
          borderBottomWidth: 1,
          borderBottomColor: Colors[colorScheme].borderColor,
        },
        headerTintColor: Colors[colorScheme].headerTint,
        headerTitleStyle: {
          fontWeight: Layout.fontWeight.bold,
          fontSize: Layout.fontSize.header, // Consistent header title size
        },
      }}>
      <Stack.Screen name="index" options={{ title: 'More Options' }} />
      <Stack.Screen name="protocols" options={{ title: 'Emergency Protocols' }} />
      <Stack.Screen name="incidents" options={{ title: 'Incident History' }} />
      <Stack.Screen name="knowledge-base" options={{ title: 'Knowledge Base' }} />
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      {/* Assuming profile is navigated to from here or MoreScreen itself */}
      {/* <Stack.Screen name="profile" options={{ title: 'My Profile' }} /> */}
    </Stack>
  );
}