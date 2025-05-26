import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'Auth Home' }} />
      <Stack.Screen name="login" options={{ title: 'Login' }} />
      <Stack.Screen name="signup" options={{ title: 'Sign Up' }} />
      <Stack.Screen name="denied" options={{ title: 'Access Denied' }} />
      <Stack.Screen name="pending-approval" options={{ title: 'Pending Approval' }} />
    </Stack>
  );
}