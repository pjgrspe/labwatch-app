// app/more/incidents.tsx
import Card from '@/components/Card';
import { Text as ThemedText, View as ThemedView } from '@/components/Themed';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';

const dummyIncidents = [
  { id: 'inc2024001', type: 'Minor Chemical Spill', date: '2024-03-10', reportedBy: 'Dr. Smith', status: 'Resolved' },
  { id: 'inc2024002', type: 'Equipment Malfunction (Centrifuge)', date: '2024-02-25', reportedBy: 'Jane Doe', status: 'Parts Ordered' },
  { id: 'inc2024003', type: 'Power Outage Response', date: '2024-01-15', reportedBy: 'Safety Team', status: 'Documented' },
];

export default function IncidentsScreen() {
  const router = useRouter();
  const containerBackgroundColor = useThemeColor({}, 'background');
  const incidentTypeColor = useThemeColor({}, 'text');
  const incidentInfoColor = useThemeColor({}, 'icon'); // For less prominent info
  const incidentStatusColor = useThemeColor({}, 'icon');


  const renderIncidentItem = ({ item }: { item: typeof dummyIncidents[0] }) => (
    <TouchableOpacity onPress={() => router.push(`/incident-details/${item.id}`)}>
      <Card style={styles.incidentCard}>
        <ThemedText style={[styles.incidentType, { color: incidentTypeColor }]}>{item.type}</ThemedText>
        <ThemedText style={[styles.incidentInfo, { color: incidentInfoColor }]}>Date: {item.date} | Reported by: {item.reportedBy}</ThemedText>
        <ThemedText style={[styles.incidentStatus, { color: incidentStatusColor }]}>Status: {item.status}</ThemedText>
      </Card>
    </TouchableOpacity>
  );

  return (
    <ThemedView style={[styles.container, { backgroundColor: containerBackgroundColor }]}>
      <FlatList
        data={dummyIncidents}
        renderItem={renderIncidentItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  incidentCard: {
    marginBottom: 12, 
  },
  incidentType: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  incidentInfo: {
    fontSize: 14,
    marginBottom: 2,
  },
  incidentStatus: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});