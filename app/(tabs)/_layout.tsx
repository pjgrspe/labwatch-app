// app/(tabs)/_layout.tsx
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
// import { useColorScheme } from '@/hooks/useColorScheme'; // If you have this hook
// import { Colors } from '@/constants/Colors'; // If you have these constants

const tabBarActiveTintColor = 'blue'; // Replace with your theme color
const tabBarInactiveTintColor = 'gray'; // Replace with your theme color

export default function TabLayout() {
  // const colorScheme = useColorScheme() ?? 'light'; // Example usage

  return (
    <Tabs
      screenOptions={{
        // tabBarActiveTintColor: Colors[colorScheme].tint, // Example theme usage
        tabBarActiveTintColor: tabBarActiveTintColor,
        tabBarInactiveTintColor: tabBarInactiveTintColor,
        headerShown: false, // Typically, individual tab screens manage their own headers if needed
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Index',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications-outline" size={size} color={color} />
          ),
          // Example: tabBarBadge: 3,
        }}
      />
      <Tabs.Screen
        name="assistant"
        options={{
          title: 'Assistant',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-ellipses-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          headerShown: false, // The 'more' screen will use its own stack navigator's header
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="menu-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}