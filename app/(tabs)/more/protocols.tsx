// app/more/protocols.tsx
import Card from '@/components/Card';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const dummyProtocols = [
  { id: 'fire-safety', name: 'Fire Safety Protocol', summary: 'Steps to take during a fire emergency.', icon: 'flame-outline' as keyof typeof Ionicons.glyphMap},
  { id: 'chemical-spill', name: 'Chemical Spill Response', summary: 'Procedure for handling chemical spills.', icon: 'flask-outline' as keyof typeof Ionicons.glyphMap },
  { id: 'evacuation', name: 'General Evacuation Plan', summary: 'Building evacuation routes and assembly points.', icon: 'walk-outline' as keyof typeof Ionicons.glyphMap },
  { id: 'first-aid', name: 'Basic First Aid', summary: 'Initial response to common lab injuries.', icon: 'medkit-outline' as keyof typeof Ionicons.glyphMap },
];

export default function ProtocolsScreen() {
  const router = useRouter();

  const renderProtocolItem = ({ item }: { item: typeof dummyProtocols[0] }) => (
     <TouchableOpacity onPress={() => router.push(`/protocol-details/${item.id}`)}>
      <Card style={styles.protocolCard}>
        <View style={styles.protocolHeader}>
           <Ionicons name={item.icon} size={24} color="#4A90E2" style={styles.protocolIcon}/>
          <Text style={styles.protocolName}>{item.name}</Text>
        </View>
        <Text style={styles.protocolSummary}>{item.summary}</Text>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={dummyProtocols}
        renderItem={renderProtocolItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
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
  },
  protocolIcon: {
    marginRight: 10,
  },
  protocolName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  protocolSummary: {
    fontSize: 14,
    color: '#666',
  },
});