import Card from '@/components/Card'; // Assuming alias @ is set up for root
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

// Dummy Data for incidents - In a real app, this would be fetched from a service
const dummyIncidentsData: { [key: string]: IncidentDetail } = {
  'inc2024001': {
    id: 'inc2024001',
    type: 'Minor Chemical Spill',
    date: '2024-03-10',
    time: '14:30',
    location: 'Lab A - Bench 3',
    reportedBy: 'Dr. Eleanor Vance',
    description: 'Approx. 50ml of 0.1M HCl spilled on the benchtop. Contained and neutralized with sodium bicarbonate. No injuries.',
    actionsTaken: [
      'Area cordoned off immediately.',
      'Spill kit utilized as per SOP-CHEM-005.',
      'Affected area decontaminated.',
      'Spill reported to Lab Safety Officer.',
    ],
    status: 'Resolved',
    severity: 'Low',
    involvedPersonnel: ['Dr. Eleanor Vance', 'Tech. John Doe (witness)'],
    images: [], // Placeholder for image URIs or identifiers
    feedback: 'Procedure followed correctly. Consider refresher on spill kit locations.',
  },
  'inc2024002': {
    id: 'inc2024002',
    type: 'Equipment Malfunction',
    date: '2024-02-25',
    time: '09:15',
    location: 'Centrifuge Room',
    reportedBy: 'Jane Doe',
    description: 'Centrifuge Model X started making unusual noises and vibrating excessively during a run. Run was immediately stopped. No sample loss.',
    actionsTaken: [
      'Equipment powered down and tagged out of service.',
      'Maintenance request submitted.',
      'Supervisor notified.',
    ],
    status: 'Parts Ordered',
    severity: 'Medium',
    involvedPersonnel: ['Jane Doe'],
    images: [],
    feedback: '',
  },
  'inc2024003': {
    id: 'inc2024003',
    type: 'Power Outage Response',
    date: '2024-01-15',
    time: '11:00 - 11:45',
    location: 'Whole Facility Wing B',
    reportedBy: 'Safety Team Lead',
    description: 'Unexpected power outage affected Wing B. Emergency generators activated within 2 minutes. Sensitive experiments were secured as per protocol.',
    actionsTaken: [
      'Emergency lighting activated.',
      'All personnel in affected labs accounted for.',
      'Critical equipment checked post-power restoration.',
      'Report filed with facilities management.',
    ],
    status: 'Documented',
    severity: 'Medium',
    involvedPersonnel: ['Safety Team', 'Lab Managers Wing B'],
    images: [],
    feedback: 'Generator response time was excellent.',
  },
   // Add more dummy incidents as needed
   'spill-2024-03-15': { // Matching the example from app/more/incidents.tsx
    id: 'spill-2024-03-15',
    type: 'Simulated Spill Event',
    date: '2024-03-15',
    time: '10:00',
    location: 'Lab Simulation Area',
    reportedBy: 'Training System',
    description: 'This is a test incident for demonstration purposes. A simulated minor solvent spill occurred during a training exercise.',
    actionsTaken: [
      'Mock spill kit deployed.',
      'Evacuation drill initiated for the immediate area.',
      'Mock report filed.',
    ],
    status: 'Resolved (Training)',
    severity: 'Informational',
    involvedPersonnel: ['Trainee A', 'Trainee B', 'Instructor'],
    images: [],
    feedback: 'Trainees responded well to the simulated event.',
  }
};

interface IncidentDetail {
  id: string;
  type: string;
  date: string;
  time: string;
  location: string;
  reportedBy: string;
  description: string;
  actionsTaken: string[];
  status: string;
  severity: string;
  involvedPersonnel: string[];
  images?: string[]; // Array of image URIs or identifiers
  feedback?: string;
}

const severityColors: { [key: string]: string } = {
  Low: '#28a745', // Green
  Medium: '#ffc107', // Yellow/Orange
  High: '#fd7e14', // Orange
  Critical: '#dc3545', // Red
  Informational: '#17a2b8' // Teal
};

export default function IncidentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const incident = id ? dummyIncidentsData[id] : null;

  if (!incident) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Incident Not Found" }} />
        <Text style={styles.errorText}>Incident not found or ID is missing.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollViewContainer}>
      <Stack.Screen options={{ title: `Incident: ${incident.id}` }} />
      <View style={styles.container}>
        <Card style={styles.headerCard}>
          <Text style={styles.mainTitle}>{incident.type}</Text>
          <View style={styles.metaInfoContainer}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color="#555" />
              <Text style={styles.metaText}>{incident.date} at {incident.time}</Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={16} color="#555" />
              <Text style={styles.metaText}>{incident.location}</Text>
            </View>
          </View>
           <View style={[styles.statusBadge, { backgroundColor: severityColors[incident.severity] || '#6c757d' }]}>
            <Text style={styles.statusBadgeText}>{incident.severity} - {incident.status}</Text>
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.bodyText}>{incident.description}</Text>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Actions Taken</Text>
          {incident.actionsTaken.map((action, index) => (
            <View key={index} style={styles.actionItem}>
              <Ionicons name="checkmark-circle-outline" size={18} color="green" style={styles.actionIcon} />
              <Text style={styles.bodyText}>{action}</Text>
            </View>
          ))}
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Involved Personnel</Text>
          {incident.involvedPersonnel.map((person, index) => (
            <Text key={index} style={styles.bodyText}>- {person}</Text>
          ))}
          <Text style={[styles.bodyText, { marginTop: 5 }]}>Reported by: {incident.reportedBy}</Text>
        </Card>

        {incident.images && incident.images.length > 0 && (
          <Card>
            <Text style={styles.sectionTitle}>Attached Images</Text>
            {/* Placeholder for image display logic */}
            <Text style={styles.bodyText}>[Image display area]</Text>
          </Card>
        )}

        {incident.feedback && (
          <Card>
            <Text style={styles.sectionTitle}>Feedback/Follow-up</Text>
            <Text style={styles.bodyText}>{incident.feedback}</Text>
          </Card>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollViewContainer: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  headerCard: {
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  metaInfoContainer: {
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 6,
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#4A4A4A',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 4,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
    marginBottom: 4,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  actionIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    color: 'red',
  },
});