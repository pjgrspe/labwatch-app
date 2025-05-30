// app/(tabs)/_layout.tsx
import { Colors, Layout } from '@/constants';
import { useColorScheme } from '@/hooks';
import { Ionicons } from '@expo/vector-icons';
import { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';

export default function TabLayout() {
  const colorScheme = (useColorScheme() ?? 'light') as 'light' | 'dark';

  const tabScreenOptions: BottomTabNavigationOptions = {
    tabBarActiveTintColor: Colors[colorScheme].tint,
    tabBarInactiveTintColor: Colors[colorScheme].tabIconDefault,
    tabBarStyle: {
      backgroundColor: Colors[colorScheme].cardBackground,
      borderTopColor: Colors[colorScheme].borderColor,
      borderTopWidth: StyleSheet.hairlineWidth,
      paddingBottom: Layout.spacing.xs,
      paddingTop: Layout.spacing.xs,
    },
    tabBarLabelStyle: {
      fontSize: Layout.fontSize.xs,
      fontWeight: Layout.fontWeight.medium as any,
      fontFamily: 'Montserrat-Medium',
      marginBottom: Platform.OS === 'ios' ? 0 : Layout.spacing.xs,
    },
    headerStyle: {
      backgroundColor: Colors[colorScheme].headerBackground,
      borderBottomWidth: 1,
      borderBottomColor: Colors[colorScheme].borderColor,
    },
    headerTintColor: Colors[colorScheme].headerTint,
    headerTitleStyle: {
      fontWeight: Layout.fontWeight.bold as any,
      fontSize: Layout.fontSize.header,
      fontFamily: 'Montserrat-Bold',
    },
    headerBackTitleStyle: false, // Ensure this is a boolean if intended
  };

  return (
    <Tabs screenOptions={tabScreenOptions}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          headerShown: true,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="rooms"
        options={{
          title: 'Rooms',
          headerShown: false, // rooms stack has its own header
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cube-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="alerts" // Assuming alerts also has its own stack navigator for header if needed
        options={{
          title: 'Alerts',
          headerShown: false, // alerts stack has its own header
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications-outline" size={size} color={color} />
          ),
        }}
      />
      {/* New Incidents Tab */}
      <Tabs.Screen
        name="incidents" // This will point to app/(tabs)/incidents/_layout.tsx
        options={{
          title: 'Incidents',
          headerShown: false, // incidents stack will manage its own header
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="archive-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          headerShown: false, // more stack has its own header
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="menu-outline" size={size} color={color} />
          ),
        }}
      />
      {/* The following line has been removed: */}
      {/* <Tabs.Screen name="index" options={{ href: null, headerShown: false }} /> */}
    </Tabs>
  );
}