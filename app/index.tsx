// labwatch-app/app/index.tsx
import { Text as ThemedText } from '@/components/Themed'; // Ensure ThemedView is imported if View below is ThemedView
import { auth } from '@/FirebaseConfig';
import { useThemeColor } from '@/hooks/useThemeColor';
import { AuthService } from '@/modules/auth/services/AuthService';
import { SplashScreen, useRouter } from 'expo-router';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, LogBox, StyleSheet, View } from 'react-native'; // Standard View

LogBox.ignoreLogs([
  'Warning: Text strings must be rendered within a <Text> component.'
]);

// Prevent the splash screen from hiding automatically until we've loaded our initial data.
SplashScreen.preventAutoHideAsync();

export default function AppEntry() {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const [isRouterReady, setIsRouterReady] = useState(false);

  useEffect(() => {
    // This effect helps ensure that the router has had a chance to mount.
    // We'll only proceed with auth checks and navigation once isRouterReady is true.
    setIsRouterReady(true);
  }, []);

  useEffect(() => {
    // If the router isn't ready, don't attempt any navigation logic.
    if (!isRouterReady) {
      return;
    }

    console.log("AppEntry: Router is ready. Starting initial authentication state check.");
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      let routeToNavigate: string;

      if (user) {
        console.log(`AppEntry: Firebase user detected: ${user.uid}. Checking profile...`);
        try {
          const userProfile = await AuthService.getUserProfile(user.uid);

          if (userProfile) {
            console.log(`AppEntry: User profile status: ${userProfile.status}`);
            if (userProfile.status === "approved") {
              routeToNavigate = "/(tabs)/dashboard"; // Navigate to the main dashboard
            } else if (userProfile.status === "pending") {
              routeToNavigate = "/auth/pending-approval";
            } else if (userProfile.status === "denied") {
              routeToNavigate = "/auth/denied";
            } else {
              console.warn("AppEntry: Unknown user profile status in Firestore. Signing out.");
              await signOut(auth);
              routeToNavigate = "/auth/login";
            }
          } else {
            console.warn("AppEntry: Firebase user exists but no Firestore profile found. Signing out.");
            await signOut(auth);
            routeToNavigate = "/auth/login";
          }
        } catch (error) {
          console.error("AppEntry: Error fetching user profile:", error);
          await signOut(auth);
          routeToNavigate = "/auth/login";
        }
      } else {
        console.log("AppEntry: No Firebase user signed in. Redirecting to login.");
        routeToNavigate = "/auth/login";
      }

      console.log(`AppEntry: Determined route: ${routeToNavigate}. Navigating...`);
      // Ensure router.replace is called. The 'as any' might be needed if routes are complex.
      router.replace(routeToNavigate as any);
      SplashScreen.hideAsync(); // Hide splash screen after navigation decision is made and acted upon
    });

    return () => {
      console.log("AppEntry: Unsubscribing from onAuthStateChanged listener.");
      unsubscribe();
    };
  }, [router, isRouterReady]); // Add isRouterReady as a dependency

  // Render a loading indicator until navigation occurs.
  // This component will effectively unmount once router.replace completes.
  return (
    <View style={[styles.loadingContainer, { backgroundColor }]}>
      <ActivityIndicator size="large" color={tintColor} />
      <ThemedText style={{ color: textColor, marginTop: 10 }}>Initializing app...</ThemedText>
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