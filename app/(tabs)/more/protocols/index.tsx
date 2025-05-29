// app/(tabs)/more/protocols/index.tsx
import { Card, ThemedText, ThemedView } from '@/components';
import { useThemeColor } from '@/hooks';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router'; // Import Stack
import React from 'react';
import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';

const dummyProtocols = [
  { id: 'fire-safety', name: 'Fire Safety Protocol', summary: 'Steps to take during a fire emergency.', icon: 'flame-outline' as keyof typeof Ionicons.glyphMap},
  { id: 'chemical-spill', name: 'Chemical Spill Response', summary: 'Procedure for handling chemical spills.', icon: 'flask-outline' as keyof typeof Ionicons.glyphMap },
  { id: 'evacuation', name: 'General Evacuation Plan', summary: 'Building evacuation routes and assembly points.', icon: 'walk-outline' as keyof typeof Ionicons.glyphMap },
  { id: 'first-aid', name: 'Basic First Aid', summary: 'Initial response to common lab injuries.', icon: 'medkit-outline' as keyof typeof Ionicons.glyphMap },
];

export default function ProtocolsListScreen() { // Renamed component
  const router = useRouter();
  const containerBackgroundColor = useThemeColor({}, 'background');
  const protocolNameColor = useThemeColor({}, 'text');
  const protocolSummaryColor = useThemeColor({}, 'icon');
  const protocolIconColor = useThemeColor({}, 'tint');

  const renderProtocolItem = ({ item }: { item: typeof dummyProtocols[0] }) => (
     <TouchableOpacity onPress={() => router.push(`/(tabs)/more/protocols/${item.id}` as any)}>
      <Card style={styles.protocolCard}>
        <ThemedView style={styles.protocolHeader}>
           <Ionicons name={item.icon} size={24} color={protocolIconColor} style={styles.protocolIcon}/>
          <ThemedText style={[styles.protocolName, { color: protocolNameColor }]}>{item.name}</ThemedText>
        </ThemedView>
        <ThemedText style={[styles.protocolSummary, { color: protocolSummaryColor }]}>{item.summary}</ThemedText>
      </Card>
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen options={{ title: 'Emergency Protocols' }} />
      <ThemedView style={[styles.container, { backgroundColor: containerBackgroundColor }]}>
        <FlatList
          data={dummyProtocols}
          renderItem={renderProtocolItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  protocolCard: {
    marginBottom: 12,
  },
  protocolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  protocolIcon: {
    marginRight: 10,
  },
  protocolName: {
    fontSize: 18,
    fontWeight: '600',
  },
  protocolSummary: {
    fontSize: 14,
  },
});