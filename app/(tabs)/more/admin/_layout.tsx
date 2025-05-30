// labwatch-app/app/(tabs)/more/admin/_layout.tsx
import { getCommonHeaderOptions } from '@/constants/NavigationOptions';
import { useColorScheme } from '@/hooks';
import { Stack } from 'expo-router';
import React from 'react';

export default function AdminLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const commonOptions = getCommonHeaderOptions(colorScheme);
  return (
    <Stack screenOptions={commonOptions}>
      <Stack.Screen name="manage-users" options={{ title: 'Manage User Signups' }} />
      <Stack.Screen name="config" options={{ title: 'System Configuration' }} />
      <Stack.Screen name="audit-logs" options={{ title: 'Audit Logs' }} />
    </Stack>
  );
}