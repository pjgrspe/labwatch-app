// app/more/_layout.tsx
import { Stack } from 'expo-router';
import React from 'react';

export default function MoreLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'More Options' }} />
      <Stack.Screen name="protocols" options={{ title: 'Emergency Protocols' }} />
      <Stack.Screen name="incidents" options={{ title: 'Incident History' }} />
      <Stack.Screen name="knowledge-base" options={{ title: 'Knowledge Base' }} />
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />
    </Stack>
  );
}