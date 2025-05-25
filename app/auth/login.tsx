// app/auth/login.tsx
import { Text as ThemedText, View as ThemedView } from '@/components/Themed';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useRouter } from 'expo-router';
import React from 'react';
import { Button, StyleSheet } from 'react-native';


export default function LoginScreen() {
  const router = useRouter();
  const buttonTextColor = useThemeColor({light: '#FFFFFF', dark: '#000000'}, 'background'); // Example for button text
  const buttonBackgroundColor = useThemeColor({}, 'tint');


  const handleLogin = () => {
    // Implement actual authentication logic here
    // For now, just navigate to the main app
    router.replace('/'); 
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Login</ThemedText>
      {/* Consider a custom ThemedButton or style Button props for theming */}
      <Button title="Log In (Simulated)" onPress={handleLogin} color={buttonBackgroundColor} />
      {/* Add your LoginForm component from /modules/auth here */}
    </ThemedView>
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