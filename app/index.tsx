// labwatch-app/app/index.tsx
import { Text as ThemedText } from '@/components/Themed';
import { auth } from '@/FirebaseConfig'; // Import Firebase auth instance
import { useThemeColor } from '@/hooks/useThemeColor';
import { AuthService } from '@/modules/auth/services/AuthService'; // Import AuthService
import { Redirect, SplashScreen } from 'expo-router';
import { onAuthStateChanged, signOut } from 'firebase/auth'; // Import onAuthStateChanged and signOut
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

// Prevent the splash screen from hiding automatically until we've loaded our initial data.
SplashScreen.preventAutoHideAsync();

export default function AppEntry() {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const backgroundColor = useThemeColor({}, 'background'); // Get background color from theme
  const tintColor = useThemeColor({}, 'tint'); // Get tint color for activity indicator
  const textColor = useThemeColor({}, 'text'); // Get text color for loading message

  useEffect(() => {
    console.log("AppEntry: Starting initial authentication state check.");
    // This listener will fire once on component mount, and whenever the auth state changes.
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      let routeToNavigate: string;

      if (user) {
        // A user is logged in via Firebase Auth. Now, check their profile status in Firestore.
        console.log(`AppEntry: Firebase user detected: ${user.uid}. Checking profile...`);
        try {
          const userProfile = await AuthService.getUserProfile(user.uid); // Fetch profile via AuthService

          if (userProfile) {
            console.log(`AppEntry: User profile status: ${userProfile.status}`);
            if (userProfile.status === "approved") {
              routeToNavigate = "/(tabs)"; // Approved users go to the main app tabs
            } else if (userProfile.status === "pending") {
              routeToNavigate = "/auth/pending-approval"; // Pending users go to the pending screen
            } else if (userProfile.status === "denied") {
              routeToNavigate = "/auth/denied"; // Denied users go to the denied screen
            } else {
              // Fallback for unknown status in Firestore. Treat as an error.
              console.warn("AppEntry: Unknown user profile status in Firestore. Signing out.");
              await signOut(auth); // Sign out to ensure a clean state
              routeToNavigate = "/auth/login"; // Redirect to login
            }
          } else {
            // This case should ideally not happen if signup always creates a user doc.
            // If a Firebase user exists but no Firestore profile, it's a bad state.
            console.warn("AppEntry: Firebase user exists but no Firestore profile found. Signing out.");
            await signOut(auth); // Sign out the Firebase user
            routeToNavigate = "/auth/login"; // Redirect to login
          }
        } catch (error) {
          // Handle any errors during profile fetching (e.g., network issues, Firestore rules preventing read)
          console.error("AppEntry: Error fetching user profile:", error);
          await signOut(auth); // Attempt to sign out to clear potentially problematic state
          routeToNavigate = "/auth/login"; // Force login on error
        }
      } else {
        // No Firebase user is signed in (either never signed in, or explicitly signed out).
        console.log("AppEntry: No Firebase user signed in. Redirecting to login.");
        routeToNavigate = "/auth/login"; // Direct to the login screen
      }

      setInitialRoute(routeToNavigate); // Set the determined initial route
      SplashScreen.hideAsync(); // Hide splash screen now that routing decision is made
    });

    // Clean up the Firebase auth state listener when the component unmounts
    return () => unsubscribe();
  }, []); // Empty dependency array ensures this effect runs only once on mount

  // If initialRoute is set, perform the redirect.
  // This component will unmount once the redirection is complete.
  if (initialRoute) {
    return <Redirect href={initialRoute as any} />;
  }

  // While the initial route is being determined (during the auth state check),
  // display a loading indicator.
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