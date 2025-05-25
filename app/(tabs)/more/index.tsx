// app/more/index.tsx
import ListItem from '@/components/ListItem'; // Corrected path
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';


export default function MoreScreen() {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');

  const menuItems = [
    { title: 'Emergency Protocols', route: '/(tabs)/more/protocols', icon: 'document-text-outline' as keyof typeof Ionicons.glyphMap },
    { title: 'Incident History', route: '/(tabs)/more/incidents', icon: 'archive-outline' as keyof typeof Ionicons.glyphMap },
    { title: 'Knowledge Base', route: '/(tabs)/more/knowledge-base', icon: 'book-outline' as keyof typeof Ionicons.glyphMap },
    { title: 'Settings', route: '/(tabs)/more/settings', icon: 'settings-outline' as keyof typeof Ionicons.glyphMap },
    { title: 'My Profile', route: '/profile', icon: 'person-circle-outline' as keyof typeof Ionicons.glyphMap },
  ] as const;

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      {menuItems.map((item) => (
        <ListItem
          key={item.title}
          title={item.title}
          onPress={() => router.push(item.route as any)} // Cast to any if type inference struggles with dynamic routes
          rightIconName="chevron-forward-outline"
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});