// labwatch-app/app/auth/denied.tsx
import { ThemedText, ThemedView } from '@/components';
import { auth } from '@/FirebaseConfig';
import { useThemeColor } from '@/hooks';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import React from 'react';
import { Button, StyleSheet, View } // Added View for Button container
  from 'react-native';

export default function DeniedScreen() {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const errorTextColor = useThemeColor({}, 'errorText'); // For a more distinct message color if desired

  const handleLogoutAndRedirect = async () => {
    try {
      await signOut(auth);
      router.replace('/auth/login');
    } catch (error) {
      console.error("Logout error from denied screen:", error);
      router.replace('/auth/login'); // Attempt to redirect anyway
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <ThemedText style={[styles.title, { color: errorTextColor }]}>Access Denied</ThemedText>
      <ThemedText style={[styles.message, { color: textColor }]}>
        Your account registration was denied or your access has been revoked.
        Please contact support if you believe this is an error.
      </ThemedText>
      <View style={styles.buttonContainer}>
        <Button title="Logout and Go to Login" onPress={handleLogoutAndRedirect} color={tintColor} />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  buttonContainer: {
    width: '80%', // Or adjust as needed
    maxWidth: 300,
    borderRadius: 8, // Optional: if you want rounded button edges (works best with custom Touchable)
    overflow: 'hidden', // For Button component on Android to respect parent's borderRadius
  }
});