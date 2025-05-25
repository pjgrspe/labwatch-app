// app/(tabs)/alerts.tsx
import Card from '@/components/Card';
import { Text as ThemedText, View as ThemedView } from '@/components/Themed';
import { ColorName } from '@/constants/Colors'; // Ensure ColorName is imported
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';

// Define the alert item structure
interface AlertItemType {
  id: string;
  type: string;
  location: string;
  time: string;
  severity: 'critical' | 'high' | 'medium' | 'low'; // Matched with dummyAlerts
  icon: keyof typeof Ionicons.glyphMap;
  details: string;
}

const dummyAlerts: AlertItemType[] = [
  { id: 'alert1', type: 'Fire Alarm', location: 'Lab A - Sector 2', time: '2 min ago', severity: 'critical', icon: 'flame', details: 'Smoke detected near chemical storage.' },
  { id: 'alert2', type: 'Temperature Anomaly', location: 'Freezer #3', time: '15 min ago', severity: 'high', icon: 'thermometer', details: 'Temperature rose to -10°C. Setpoint -20°C.' },
  { id: 'alert3', type: 'Gas Leak Suspected', location: 'Lab C - Hood 4', time: '1 hour ago', severity: 'medium', icon: 'cloud-outline', details: 'Ammonia sensor triggered at low levels.' },
  { id: 'alert4', type: 'Equipment Offline', location: 'Autoclave Beta', time: '3 hours ago', severity: 'low', icon: 'power', details: 'Device unexpectedly powered down.' },
];

// Mapping of severity levels to theme color names
const severityThemeColors: { [key in AlertItemType['severity']]: ColorName } = {
  critical: 'errorText',
  high: 'warningText', // Or a more intense orange if defined
  medium: 'warningText',
  low: 'successText',
};

// New component for rendering each alert item
const AlertItem: React.FC<{ item: AlertItemType }> = ({ item }) => {
  const router = useRouter();
  
  // Hooks are now correctly called within a React function component
  const itemSeverityColor = useThemeColor({}, severityThemeColors[item.severity] || 'text');
  const alertTypeColor = useThemeColor({}, 'text');
  const alertTimeColor = useThemeColor({}, 'icon');
  const alertLocationColor = useThemeColor({}, 'text');
  const alertDetailsColor = useThemeColor({}, 'icon');

  return (
    <TouchableOpacity onPress={() => router.push(`/alert-details/${item.id}`)}>
      <Card style={[styles.alertCard, { borderLeftColor: itemSeverityColor }]}>
        <ThemedView style={styles.alertHeader}>
          <Ionicons name={item.icon} size={24} color={itemSeverityColor} style={styles.alertIcon} />
          <ThemedText style={[styles.alertType, { color: alertTypeColor }]}>{item.type}</ThemedText>
          <ThemedText style={[styles.alertTime, { color: alertTimeColor }]}>{item.time}</ThemedText>
        </ThemedView>
        <ThemedText style={[styles.alertLocation, { color: alertLocationColor }]}>{item.location}</ThemedText>
        <ThemedText style={[styles.alertDetails, { color: alertDetailsColor }]}>{item.details}</ThemedText>
      </Card>
    </TouchableOpacity>
  );
};

export default function AlertsScreen() {
  const containerBackgroundColor = useThemeColor({}, 'background');

  return (
    <ThemedView style={[styles.container, { backgroundColor: containerBackgroundColor }]}>
      <FlatList
        data={dummyAlerts}
        renderItem={({ item }) => <AlertItem item={item} />} // Use the new component
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
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
    backgroundColor: 'transparent', 
  },
  alertIcon: {
    marginRight: 10,
  },
  alertType: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  alertTime: {
    fontSize: 12,
  },
  alertLocation: {
    fontSize: 15,
    marginBottom: 4,
  },
  alertDetails: {
    fontSize: 14,
  },
});