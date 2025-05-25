// app/more/index.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import ListItem from '../../../components/ListItem';

export default function MoreScreen() {
  const router = useRouter();

  const menuItems = [
    { title: 'Emergency Protocols', route: '/more/protocols', icon: 'document-text-outline' as keyof typeof Ionicons.glyphMap },
    { title: 'Incident History', route: '/more/incidents', icon: 'archive-outline' as keyof typeof Ionicons.glyphMap },
    { title: 'Knowledge Base', route: '/more/knowledge-base', icon: 'book-outline' as keyof typeof Ionicons.glyphMap },
    { title: 'Settings', route: '/more/settings', icon: 'settings-outline' as keyof typeof Ionicons.glyphMap },
    { title: 'My Profile', route: '/profile', icon: 'person-circle-outline' as keyof typeof Ionicons.glyphMap },
  ] as const;

  return (
    <ScrollView style={styles.container}>
      {menuItems.map((item) => (
        <ListItem
          key={item.title}
          title={item.title}
          onPress={() => router.push(item.route)}
          rightIconName="chevron-forward-outline"
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0', // Slightly different background for sections
  },
});