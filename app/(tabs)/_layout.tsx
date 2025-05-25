// labwatch-app/app/(tabs)/_layout.tsx
import { Colors } from '@/constants/Colors';
import Layout from '@/constants/Layout'; // Import Layout
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        tabBarInactiveTintColor: Colors[colorScheme].tabIconDefault,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme].cardBackground, // Using cardBackground for a slightly elevated look
          borderTopColor: Colors[colorScheme].borderColor,
          borderTopWidth: StyleSheet.hairlineWidth, // Keep it subtle
          // height: 60, // Optional: if you want a specific height
          paddingBottom: Layout.spacing.xs, // Add some padding for labels if needed
          paddingTop: Layout.spacing.xs,
        },
        tabBarLabelStyle: {
          fontSize: Layout.fontSize.xs,
          fontWeight: Layout.fontWeight.medium,
        },
        headerStyle: {
          backgroundColor: Colors[colorScheme].headerBackground,
          elevation: 0, // Remove shadow for a flatter look like the image
          shadowOpacity: 0, // Remove shadow for iOS
          borderBottomWidth: 1,
          borderBottomColor: Colors[colorScheme].borderColor,
        },
        headerTintColor: Colors[colorScheme].headerTint,
        headerTitleStyle: {
          fontWeight: Layout.fontWeight.bold,
          fontSize: Layout.fontSize.header,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home', // Changed from Dashboard to Home as per image
          headerShown: true, // The image shows "My Sweet Home" header
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} /> // Changed icon
          ),
        }}
      />
      <Tabs.Screen
        name="rooms"
        options={{
          title: 'Rooms',
          headerShown: true,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cube-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alerts', // Placeholder for one of the image's icons
          headerShown: true,
          tabBarIcon: ({ color, size }) => (
            // Choosing an icon that might fit the 'notifications' or 'activity' feel from image
            <Ionicons name="notifications-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More', // Or Profile, matching the rightmost icon in image
          headerShown: false, // The 'More' stack has its own header
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} /> // Changed to profile-like icon
          ),
        }}
      />
    </Tabs>
  );
}

// Need to ensure StyleSheet is imported if using StyleSheet.hairlineWidth
import { StyleSheet } from 'react-native';

