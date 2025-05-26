// app/(tabs)/more/admin/_layout.tsx
import { Colors } from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Stack } from 'expo-router';
import React from 'react';

export default function AdminLayout() {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors[colorScheme].headerBackground,
        },
        headerTintColor: Colors[colorScheme].headerTint,
        headerTitleStyle: {
          fontWeight: Layout.fontWeight.bold,
          fontSize: Layout.fontSize.header,
        },
      }}>
      <Stack.Screen name="manage-users" options={{ title: 'Manage User Signups' }} />
      {/* Add other admin screens here if needed */}
    </Stack>
  );
}