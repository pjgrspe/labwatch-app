// labwatch-app/app/auth/pending-approval.tsx
import { ThemedText, ThemedView } from '@/components';
import { auth } from '@/FirebaseConfig';
import { useThemeColor } from '@/hooks';
import { AuthService } from '@/modules/auth/services/AuthService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Button, StyleSheet, View } from 'react-native'; // Added View here

export default function PendingApprovalScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const containerBackgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const cardBackgroundColor = useThemeColor({}, 'cardBackground');
  const iconColor = useThemeColor({}, 'icon');

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
      router.replace('/auth/login');
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Logout Error", "Failed to log out.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshStatus = async () => {
    setIsLoading(true);
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const userProfile = await AuthService.getUserProfile(currentUser.uid);
        if (userProfile?.status === "approved") {
          router.replace('/(tabs)/dashboard');
        } else if (userProfile?.status === "denied") {
          Alert.alert(
            "Account Denied",
            "Your account registration was denied. Please contact support or sign up again.",
            [{ text: "OK", onPress: () => handleLogout() }]
          );
        } else if (userProfile?.status === "pending") {
          Alert.alert("Still Pending", "Your account is still awaiting approval. Please check back later.");
        } else {
           Alert.alert("Unknown Status", "Could not determine account status. Please try logging out and in again.");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        Alert.alert("Error", "Could not fetch your account status. Please try again.");
      }
    } else {
      Alert.alert("Not Authenticated", "Please log in again.",
        [{text: "OK", onPress: () => router.replace('/auth/login')}]
      );
    }
    setIsLoading(false);
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: containerBackgroundColor }]}>
      <ThemedView style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
        <Ionicons name="hourglass-outline" size={64} color={tintColor} style={styles.icon} />
        <ThemedText style={[styles.title, { color: textColor }]}>Awaiting Approval</ThemedText>
        <ThemedText style={[styles.message, { color: textColor }]}>
          Your account registration has been received and is currently awaiting approval from an administrator.
        </ThemedText>
        <ThemedText style={[styles.message, { color: iconColor, fontSize: 12, marginTop: 8 }]}>
          You will be notified once your account is approved. You can try refreshing your status.
        </ThemedText>

        {isLoading ? (
          <ActivityIndicator size="large" color={tintColor} style={styles.buttonSpacing} />
        ) : (
          <>
            <View style={[styles.buttonContainer, styles.buttonSpacing]}>
              <Button title="Refresh Status" onPress={handleRefreshStatus} color={tintColor} />
            </View>
            <View style={styles.buttonContainer}>
              <Button title="Logout" onPress={handleLogout} color={useThemeColor({}, 'errorText')} />
            </View>
          </>
        )}
      </ThemedView>
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
  card: {
    width: '100%',
    maxWidth: 400,
    padding: 25,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 22,
  },
  buttonContainer: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  buttonSpacing: {
    marginBottom: 15,
    marginTop: 15,
  },
});