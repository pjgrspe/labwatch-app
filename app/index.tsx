// app/index.tsx
import { Redirect } from 'expo-router';
import React from 'react';

export default function Index() {
  // Always redirect to the /auth route.
  // app/auth/index.tsx will handle all authentication checks (Firebase auth state + Firestore profile status)
  // and then redirect to the appropriate screen (login, pending, denied, or main app).
  // This simplifies the app's entry point and centralizes auth logic.
  return <Redirect href="/auth" />;
}