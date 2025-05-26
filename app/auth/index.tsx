// labwatch-app/app/auth/index.tsx
import { Text as ThemedText } from '@/components/Themed';
import { auth } from '@/FirebaseConfig';
import { useThemeColor } from '@/hooks/useThemeColor';
import { AuthService } from '@/modules/auth/services/AuthService';
import { useRouter } from 'expo-router'; // Removed Redirect as we'll use router.replace
import { signOut } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function AuthIndexScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [statusChecked, setStatusChecked] = useState(false);
  // No need to store currentUser/userProfile state here if navigation is handled in useEffect

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');

  useEffect(() => {
    console.log("AuthIndexScreen: useEffect for auth state check triggered.");
    const unsubscribe = AuthService.onAuthStateChanged(async (user, initialProfile) => {
      console.log("AuthService reported user in app/auth/index.tsx:", user ? user.uid : null, "Initial Profile:", initialProfile);
      let targetRoute: string | null = null;

      if (user) {
        try {
          const freshProfile = await AuthService.getUserProfile(user.uid);
          console.log("Fresh profile fetched in app/auth/index.tsx:", freshProfile);

          if (freshProfile) {
            if (freshProfile.status === "approved") {
              targetRoute = "/(tabs)";
            } else if (freshProfile.status === "pending") {
              targetRoute = "/auth/pending-approval";
            } else if (freshProfile.status === "denied") {
              targetRoute = "/auth/denied";
            } else {
              console.warn("Unknown profile status in app/auth/index.tsx:", freshProfile.status);
              await signOut(auth);
              targetRoute = "/auth/login";
            }
          } else {
            console.warn("User exists in Firebase auth, but no profile in Firestore. UID:", user.uid);
            await signOut(auth);
            targetRoute = "/auth/login";
          }
        } catch (error) {
          console.error("Error fetching/processing profile in app/auth/index.tsx:", error);
          await signOut(auth);
          targetRoute = "/auth/login";
        }
      } else {
        targetRoute = "/auth/login";
      }

      if (targetRoute) {
        console.log(`Attempting to navigate from app/auth/index.tsx to: ${targetRoute}`);
        router.replace(targetRoute as any);
      } else {
        // Fallback if targetRoute somehow remains null, though logic above should cover all cases
        console.error("Error: Navigation target route is null in app/auth/index.tsx. Defaulting to login.");
        router.replace('/auth/login');
      }
      // setLoading(false) and setStatusChecked(true) are less critical here
      // as the primary action is navigation. The loading UI will persist until navigation occurs.
    });

    return () => {
      console.log("AuthIndexScreen: Unsubscribing from onAuthStateChanged.");
      unsubscribe();
    };
  }, [router]); // Add router to dependencies

  // Display a loading indicator permanently until navigation occurs.
  // The component should unmount upon successful navigation via router.replace().
  return (
    <View style={[styles.loadingContainer, { backgroundColor }]}>
      <ActivityIndicator size="large" color={tintColor} />
      <ThemedText style={{ color: textColor, marginTop: 10 }}>Verifying authentication...</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  }
});