// labwatch-app/app/_layout.tsx
import { getCommonHeaderOptions } from '@/constants/NavigationOptions'; // Import the new function
import { useColorScheme } from '@/hooks/useColorScheme';
import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from '@expo-google-fonts/montserrat';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { View } from 'react-native';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Montserrat-Regular': Montserrat_400Regular,
    'Montserrat-Medium': Montserrat_500Medium,
    'Montserrat-SemiBold': Montserrat_600SemiBold,
    'Montserrat-Bold': Montserrat_700Bold,
    ...Ionicons.font,
  });

  const colorScheme = useColorScheme() ?? 'light';
  const commonOptions = getCommonHeaderOptions(colorScheme);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
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
        {/* Auth stack is self-contained with its own layout, no specific options here unless overriding */}
        <Stack.Screen name="auth" options={{ headerShown: false }} />

        {/* Modal Screens */}
        <Stack.Screen
          name="assistant"
          options={{
            title: 'AI Assistant',
            presentation: 'modal',
            // Header styles will be inherited from commonOptions
          }}
        />
        <Stack.Screen
          name="profile"
          options={{
            title: 'User Profile',
            // Header styles will be inherited
          }}
        />
        <Stack.Screen
          name="modals/add-room"
          options={{
            title: 'Add New Room',
            presentation: 'modal',
            // Header styles will be inherited
          }}
        />
        <Stack.Screen
          name="modals/edit-room"
          options={{
            title: 'Edit Room',
            presentation: 'modal',
            // Header styles will be inherited
          }}
        />
        <Stack.Screen name="+not-found" options={{ title: 'Oops!'}} />
      </Stack>
    </View>
  );
}