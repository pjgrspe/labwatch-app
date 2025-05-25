// app/index.tsx
import { Redirect } from 'expo-router';
import React from 'react';

// This component can be used to check auth status and redirect accordingly
// For now, it just redirects to the dashboard.
export default function Index() {
  // Replace true with your authentication check
  const isAuthenticated = true; // Simulate user is authenticated

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />; // Redirect to the entry of the (tabs) group
                                       // which will be app/(tabs)/index.tsx (our dashboard)
  } else {
    return <Redirect href="/auth/login" />;
  }
}