// labwatch-app/app/_layout.tsx
import FloatingAssistantButton from '@/components/FloatingAssistantButton'; //
import { getCommonHeaderOptions } from '@/constants/NavigationOptions'; //
import { useColorScheme } from '@/hooks/useColorScheme'; //
import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from '@expo-google-fonts/montserrat';
import { Ionicons } from '@expo/vector-icons'; // Ensure this import is correct
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import 'react-native-get-random-values'; // For uuid

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  console.log("Value of Ionicons.font:", Ionicons.font); // <-- DEBUG LINE

  const [loaded, error] = useFonts({
    'Montserrat-Regular': Montserrat_400Regular,
    'Montserrat-Medium': Montserrat_500Medium,
    'Montserrat-SemiBold': Montserrat_600SemiBold,
    'Montserrat-Bold': Montserrat_700Bold,
    ...(Ionicons.font || {}), // <-- Safeguard: spread an empty object if Ionicons.font is undefined
  });

  const colorScheme = useColorScheme() ?? 'light'; //
  const commonOptions = getCommonHeaderOptions(colorScheme); //

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
    if (error) {
      console.error("Font loading error:", error); // <-- Log font errors
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack screenOptions={commonOptions}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen
          name="assistant"
          options={{
            title: 'AI Assistant',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="profile"
          options={{
            title: 'User Profile',
          }}
        />
        <Stack.Screen
          name="modals/add-room"
          options={{
            title: 'Add New Room',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="modals/edit-room"
          options={{
            title: 'Edit Room',
            presentation: 'modal',
          }}
        />
        <Stack.Screen name="+not-found" options={{ title: 'Oops!'}} />
      </Stack>
      <FloatingAssistantButton />
    </View>
  );
}