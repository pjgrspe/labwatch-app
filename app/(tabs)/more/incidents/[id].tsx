// labwatch-app/app/incident-details/[id].tsx
import Card from '@/components/Card';
import { Text as ThemedText, View as ThemedView } from '@/components/Themed';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

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
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Informational'; // Standardized casing
  involvedPersonnel: string[];
  images?: string[];
  feedback?: string;
}

const dummyIncidentsData: { [key: string]: IncidentDetail } = {
  'inc2024001': { id: 'inc2024001', type: 'Minor Chemical Spill', date: '2024-03-10', time: '14:30', location: 'Lab A - Bench 3', reportedBy: 'Dr. Eleanor Vance', description: 'Approx. 50ml of 0.1M HCl spilled on the benchtop. Contained and neutralized with sodium bicarbonate. No injuries.', actionsTaken: [ 'Area cordoned off immediately.', 'Spill kit utilized as per SOP-CHEM-005.', 'Affected area decontaminated.', 'Spill reported to Lab Safety Officer.'], status: 'Resolved', severity: 'Low', involvedPersonnel: ['Dr. Eleanor Vance', 'Tech. John Doe (witness)'], images: [], feedback: 'Procedure followed correctly. Consider refresher on spill kit locations.' },
  'inc2024002': { id: 'inc2024002', type: 'Equipment Malfunction', date: '2024-02-25', time: '09:15', location: 'Centrifuge Room', reportedBy: 'Jane Doe', description: 'Centrifuge Model X started making unusual noises and vibrating excessively during a run. Run was immediately stopped. No sample loss.', actionsTaken: [ 'Equipment powered down and tagged out of service.', 'Maintenance request submitted.', 'Supervisor notified.'], status: 'Parts Ordered', severity: 'Medium', involvedPersonnel: ['Jane Doe'], images: [], feedback: '' },
  'inc2024003': { id: 'inc2024003', type: 'Power Outage Response', date: '2024-01-15', time: '11:00 - 11:45', location: 'Whole Facility Wing B', reportedBy: 'Safety Team Lead', description: 'Unexpected power outage affected Wing B. Emergency generators activated within 2 minutes. Sensitive experiments were secured as per protocol.', actionsTaken: [ 'Emergency lighting activated.', 'All personnel in affected labs accounted for.', 'Critical equipment checked post-power restoration.', 'Report filed with facilities management.'], status: 'Documented', severity: 'Medium', involvedPersonnel: ['Safety Team', 'Lab Managers Wing B'], images: [], feedback: 'Generator response time was excellent.' },
  'spill-2024-03-15': { id: 'spill-2024-03-15', type: 'Simulated Spill Event', date: '2024-03-15', time: '10:00', location: 'Lab Simulation Area', reportedBy: 'Training System', description: 'This is a test incident for demonstration purposes. A simulated minor solvent spill occurred during a training exercise.', actionsTaken: [ 'Mock spill kit deployed.', 'Evacuation drill initiated for the immediate area.', 'Mock report filed.'], status: 'Resolved (Training)', severity: 'Informational', involvedPersonnel: ['Trainee A', 'Trainee B', 'Instructor'], images: [], feedback: 'Trainees responded well to the simulated event.' }
};

const severityThemeColors: { [key: string]: keyof typeof import('@/constants/Colors').Colors.light } = {
  Critical: 'errorText',
  High: 'errorText', // Or a different shade like a strong orange
  Medium: 'warningText',
  Low: 'successText',
  Informational: 'infoText'
};


export default function IncidentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const incident = id ? dummyIncidentsData[id] : null;

  const scrollViewBackgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const metaTextColor = useThemeColor({}, 'icon');
  const sectionTitleColor = useThemeColor({}, 'text');
  const cardBorderColor = useThemeColor({}, 'borderColor');
  const actionIconColor = useThemeColor({light: 'green', dark: '#30D158'}, 'successText'); // Example for checkmark
  const errorTextColor = useThemeColor({}, 'errorText');


  if (!incident) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: "Incident Not Found" }} />
        <ThemedText style={[styles.errorText, { color: errorTextColor }]}>Incident not found or ID is missing.</ThemedText>
      </ThemedView>
    );
  }
  const incidentSeverityColor = useThemeColor({}, severityThemeColors[incident.severity] || 'text');


  return (
    <ScrollView style={[styles.scrollViewContainer, { backgroundColor: scrollViewBackgroundColor }]}>
      <Stack.Screen options={{ title: `Incident: ${incident.id}` }} />
      <ThemedView style={styles.container}>
        <Card style={styles.headerCard}>
          <ThemedText style={[styles.mainTitle, { color: textColor }]}>{incident.type}</ThemedText>
          <ThemedView style={styles.metaInfoContainer}>
            <ThemedView style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={16} color={metaTextColor} />
              <ThemedText style={[styles.metaText, { color: metaTextColor }]}>{incident.date} at {incident.time}</ThemedText>
            </ThemedView>
            <ThemedView style={styles.metaItem}>
              <Ionicons name="location-outline" size={16} color={metaTextColor} />
              <ThemedText style={[styles.metaText, { color: metaTextColor }]}>{incident.location}</ThemedText>
            </ThemedView>
          </ThemedView>
           <ThemedView style={[styles.statusBadge, { backgroundColor: incidentSeverityColor }]}>
            <ThemedText style={styles.statusBadgeText}>{incident.severity} - {incident.status}</ThemedText>
          </ThemedView>
        </Card>

        <Card>
          <ThemedText style={[styles.sectionTitle, { color: sectionTitleColor, borderBottomColor: cardBorderColor }]}>Description</ThemedText>
          <ThemedText style={[styles.bodyText, { color: textColor }]}>{incident.description}</ThemedText>
        </Card>

        <Card>
          <ThemedText style={[styles.sectionTitle, { color: sectionTitleColor, borderBottomColor: cardBorderColor }]}>Actions Taken</ThemedText>
          {incident.actionsTaken.map((action, index) => (
            <ThemedView key={index} style={styles.actionItem}>
              <Ionicons name="checkmark-circle-outline" size={18} color={actionIconColor} style={styles.actionIcon} />
              <ThemedText style={[styles.bodyText, { color: textColor }]}>{action}</ThemedText>
            </ThemedView>
          ))}
        </Card>

        <Card>
          <ThemedText style={[styles.sectionTitle, { color: sectionTitleColor, borderBottomColor: cardBorderColor }]}>Involved Personnel</ThemedText>
          {incident.involvedPersonnel.map((person, index) => (
            <ThemedText key={index} style={[styles.bodyText, { color: textColor }]}>- {person}</ThemedText>
          ))}
          <ThemedText style={[styles.bodyText, { marginTop: 5, color: textColor }]}>Reported by: {incident.reportedBy}</ThemedText>
        </Card>

        {incident.images && incident.images.length > 0 && (
          <Card>
            <ThemedText style={[styles.sectionTitle, { color: sectionTitleColor, borderBottomColor: cardBorderColor }]}>Attached Images</ThemedText>
            <ThemedText style={[styles.bodyText, { color: textColor }]}>[Image display area]</ThemedText>
          </Card>
        )}

        {incident.feedback && (
          <Card>
            <ThemedText style={[styles.sectionTitle, { color: sectionTitleColor, borderBottomColor: cardBorderColor }]}>Feedback/Follow-up</ThemedText>
            <ThemedText style={[styles.bodyText, { color: textColor }]}>{incident.feedback}</ThemedText>
          </Card>
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollViewContainer: {
    flex: 1,
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
  },
  metaInfoContainer: {
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  metaText: {
    fontSize: 14,
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
    paddingBottom: 4,
    borderBottomWidth: 1,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 4,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
    backgroundColor: 'transparent',
  },
  actionIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
});