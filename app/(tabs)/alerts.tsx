// app/(tabs)/alerts.tsx
import Card from '@/components/Card';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Dummy Data
const dummyAlerts = [
  { id: 'alert1', type: 'Fire Alarm', location: 'Lab A - Sector 2', time: '2 min ago', severity: 'critical', icon: 'flame' as keyof typeof Ionicons.glyphMap, details: 'Smoke detected near chemical storage.' },
  { id: 'alert2', type: 'Temperature Anomaly', location: 'Freezer #3', time: '15 min ago', severity: 'high', icon: 'thermometer' as keyof typeof Ionicons.glyphMap, details: 'Temperature rose to -10°C. Setpoint -20°C.' },
  { id: 'alert3', type: 'Gas Leak Suspected', location: 'Lab C - Hood 4', time: '1 hour ago', severity: 'medium', icon: 'cloud-outline'as keyof typeof Ionicons.glyphMap, details: 'Ammonia sensor triggered at low levels.' },
  { id: 'alert4', type: 'Equipment Offline', location: 'Autoclave Beta', time: '3 hours ago', severity: 'low', icon: 'power' as keyof typeof Ionicons.glyphMap, details: 'Device unexpectedly powered down.' },
] as const;

const severityColors = {
  critical: '#D0021B',
  high: '#F5A623',
  medium: '#F8E71C',
  low: '#7ED321',
};

export default function AlertsScreen() {
  const router = useRouter();

  const renderAlertItem = ({ item }: { item: (typeof dummyAlerts)[number] }) => (
    <TouchableOpacity onPress={() => router.push(`/alert-details/${item.id}`)}>
      <Card style={[styles.alertCard, { borderLeftColor: severityColors[item.severity] }]}>
        <View style={styles.alertHeader}>
          <Ionicons name={item.icon} size={24} color={severityColors[item.severity]} style={styles.alertIcon} />
          <Text style={styles.alertType}>{item.type}</Text>
          <Text style={styles.alertTime}>{item.time}</Text>
        </View>
        <Text style={styles.alertLocation}>{item.location}</Text>
        <Text style={styles.alertDetails}>{item.details}</Text>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Active Alerts</Text>
      <FlatList
        data={dummyAlerts}
        renderItem={renderAlertItem}
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
    paddingTop: 10, // Adjust as needed if not using a header from the layout
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10, // For when no header is shown from layout
    color: '#333',
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  alertCard: {
    borderLeftWidth: 5,
    marginBottom: 12,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertIcon: {
    marginRight: 10,
  },
  alertType: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  alertTime: {
    fontSize: 12,
    color: '#777',
  },
  alertLocation: {
    fontSize: 15,
    color: '#555',
    marginBottom: 4,
  },
  alertDetails: {
    fontSize: 14,
    color: '#666',
  },
});