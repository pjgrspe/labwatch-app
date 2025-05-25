// app/more/incidents.tsx
import Card from '@/components/Card';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const dummyIncidents = [
  { id: 'inc2024001', type: 'Minor Chemical Spill', date: '2024-03-10', reportedBy: 'Dr. Smith', status: 'Resolved' },
  { id: 'inc2024002', type: 'Equipment Malfunction (Centrifuge)', date: '2024-02-25', reportedBy: 'Jane Doe', status: 'Parts Ordered' },
  { id: 'inc2024003', type: 'Power Outage Response', date: '2024-01-15', reportedBy: 'Safety Team', status: 'Documented' },
];

export default function IncidentsScreen() {
  const router = useRouter();

  const renderIncidentItem = ({ item }: { item: typeof dummyIncidents[0] }) => (
    <TouchableOpacity onPress={() => router.push(`/incident-details/${item.id}`)}>
      <Card style={styles.incidentCard}>
        <Text style={styles.incidentType}>{item.type}</Text>
        <Text style={styles.incidentInfo}>Date: {item.date} | Reported by: {item.reportedBy}</Text>
        <Text style={styles.incidentStatus}>Status: {item.status}</Text>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={dummyIncidents}
        renderItem={renderIncidentItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
      {/* Button to add new incident could go here, linking to a modal or new screen */}
      {/* e.g. <Link href="/(modals)/report-incident" asChild>...</Link> */}
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
  incidentCard: {
    marginBottom: 12,
  },
  incidentType: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  incidentInfo: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  incidentStatus: {
    fontSize: 14,
    color: '#777',
    fontStyle: 'italic',
  },
});