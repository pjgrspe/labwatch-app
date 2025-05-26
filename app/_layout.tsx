// labwatch-app/app/_layout.tsx
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { View } from 'react-native';

// Import desired Montserrat font variants
import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
} from '@expo-google-fonts/montserrat'; //

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    // 'SpaceMono': require('../assets/fonts/SpaceMono-Regular.ttf'), // Remove or comment out if not needed
    'Montserrat-Regular': Montserrat_400Regular, //
    'Montserrat-Medium': Montserrat_500Medium,   //
    'Montserrat-SemiBold': Montserrat_600SemiBold, //
    'Montserrat-Bold': Montserrat_700Bold,     //
    ...Ionicons.font,
  });

  const colorScheme = useColorScheme() ?? 'light';

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
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors[colorScheme].headerBackground,
          },
          headerTintColor: Colors[colorScheme].headerTint,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="assistant" options={{ title: 'AI Assistant', presentation: 'modal' }} />
        <Stack.Screen name="alert-details/[id]" options={{ title: 'Alert Details' }} />
        <Stack.Screen name="protocol-details/[id]" options={{ title: 'Protocol Details' }} />
        <Stack.Screen name="incident-details/[id]" options={{ title: 'Incident Details' }} />
        <Stack.Screen name="profile" options={{ title: 'User Profile' }} />
        {/* Add new modal screen for adding rooms */}
        <Stack.Screen name="modals/add-room" options={{ title: 'Add New Room', presentation: 'modal' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      {/* <FloatingAssistantButton /> */}
    </View>
  );
}