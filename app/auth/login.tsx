// app/auth/login.tsx
import { useRouter } from 'expo-router';
import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();

  const handleLogin = () => {
    // Implement actual authentication logic here
    // For now, just navigate to the main app
    router.replace('/'); // Or simply '/' if dashboard is the root of (tabs)
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <Button title="Log In (Simulated)" onPress={handleLogin} />
      {/* Add your LoginForm component from /modules/auth here */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});