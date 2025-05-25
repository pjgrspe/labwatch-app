// labwatch-app/app/alert-details/[id].tsx
import Card from '@/components/Card';
import { Text as ThemedText, View as ThemedView } from '@/components/Themed';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

interface AlertDetail {
  id: string;
  type: string;
  location: string;
  time: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  icon: keyof typeof Ionicons.glyphMap;
  details: string;
  suggestedActions?: string[];
  responsiblePerson?: string;
}

const dummyAlertsData: { [key: string]: AlertDetail } = {
  alert1: { id: 'alert1', type: 'Fire Alarm', location: 'Lab A - Sector 2', time: '2 min ago', severity: 'critical', icon: 'flame', details: 'Smoke detected near chemical storage cabinet. High concentration of particulates measured.', suggestedActions: ['Activate building alarm', 'Evacuate area immediately', 'Notify emergency services (911)', 'Contact Lab Safety Officer: Dr. Smith (x5555)'], responsiblePerson: 'Floor Warden / Safety Officer' },
  alert2: { id: 'alert2', type: 'Temperature Anomaly', location: 'Freezer #3 (-80C)', time: '15 min ago', severity: 'high', icon: 'thermometer', details: 'Temperature rose to -65°C. Setpoint -80°C. Potential sample degradation.', suggestedActions: ['Check freezer door seal', 'Verify power supply', 'Notify Lab Manager: Dr. Jones (x5556)', 'Prepare backup freezer if necessary'], responsiblePerson: 'Assigned Lab Technician' },
  alert3: { id: 'alert3', type: 'Gas Leak Suspected', location: 'Lab C - Hood 4', time: '1 hour ago', severity: 'medium', icon: 'cloud-outline', details: 'Ammonia sensor triggered at 25 ppm. Odor reported.', suggestedActions: ['Increase fume hood ventilation', 'Evacuate immediate area around hood', 'Check for visible spills or container damage', 'Notify Lab Safety Officer'], responsiblePerson: 'User of Hood 4 / Lab Safety Officer' },
  alert4: { id: 'alert4', type: 'Equipment Offline', location: 'Autoclave Beta', time: '3 hours ago', severity: 'low', icon: 'power', details: 'Device unexpectedly powered down. Scheduled run interrupted.', suggestedActions: ['Check power breaker', 'Attempt soft reset if applicable', 'Report to equipment manager', 'Log downtime'], responsiblePerson: 'Equipment Manager / Lab Supervisor' },
  info1: {id: 'info1', type: 'Scheduled Maintenance', location: 'HPLC System 1', time: 'Tomorrow 9:00 AM', severity: 'info', icon: 'build-outline', details: 'Preventative maintenance scheduled for HPLC System 1. System will be unavailable from 9 AM to 1 PM.', responsiblePerson: 'Service Engineer'}
};

const severityThemeColors: { [key: string]: keyof typeof import('@/constants/Colors').Colors.light } = {
  critical: 'errorText',
  high: 'warningText',
  medium: 'warningText', // Or a custom color
  low: 'successText',
  info: 'infoText'
};

export default function AlertDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const alert = id ? dummyAlertsData[id] : null;

  const scrollViewBackgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const metaTextColor = useThemeColor({}, 'icon');
  const sectionTitleColor = useThemeColor({}, 'text'); // Or a more specific like 'headerTint'
  const cardBorderColor = useThemeColor({}, 'borderColor');
  const actionIconColor = useThemeColor({}, 'tint');


  if (!alert) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: "Alert Not Found" }} />
        <ThemedText style={[styles.errorText, {color: useThemeColor({}, 'errorText')}]}>Alert not found or ID is missing.</ThemedText>
      </ThemedView>
    );
  }
  const alertSeverityColor = useThemeColor({}, severityThemeColors[alert.severity] || 'text');

  return (
    <ScrollView style={[styles.scrollViewContainer, { backgroundColor: scrollViewBackgroundColor }]}>
      <Stack.Screen options={{ title: `Alert: ${alert.type}` }} />
      <ThemedView style={styles.container}>
        <Card style={[styles.headerCard, { borderLeftColor: alertSeverityColor }]}>
          <ThemedView style={styles.titleContainer}>
            <Ionicons name={alert.icon || 'alert-circle-outline'} size={30} color={alertSeverityColor} style={styles.headerIcon} />
            <ThemedText style={[styles.mainTitle, { color: textColor }]}>{alert.type}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.metaInfoContainer}>
            <ThemedView style={styles.metaItem}>
              <Ionicons name="location-outline" size={16} color={metaTextColor} />
              <ThemedText style={[styles.metaText, { color: metaTextColor }]}>{alert.location}</ThemedText>
            </ThemedView>
            <ThemedView style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color={metaTextColor} />
              <ThemedText style={[styles.metaText, { color: metaTextColor }]}>{alert.time}</ThemedText>
            </ThemedView>
          </ThemedView>
          <ThemedView style={[styles.severityBadge, { backgroundColor: alertSeverityColor }]}>
            <ThemedText style={styles.severityBadgeText}>{alert.severity.toUpperCase()}</ThemedText>
          </ThemedView>
        </Card>

        <Card>
          <ThemedText style={[styles.sectionTitle, { color: sectionTitleColor, borderBottomColor: cardBorderColor }]}>Details</ThemedText>
          <ThemedText style={[styles.bodyText, { color: textColor }]}>{alert.details}</ThemedText>
        </Card>

        {alert.suggestedActions && alert.suggestedActions.length > 0 && (
          <Card>
            <ThemedText style={[styles.sectionTitle, { color: sectionTitleColor, borderBottomColor: cardBorderColor }]}>Suggested Actions</ThemedText>
            {alert.suggestedActions.map((action, index) => (
              <ThemedView key={index} style={styles.actionItem}>
                <Ionicons name="arrow-forward-circle-outline" size={18} color={actionIconColor} style={styles.actionIcon} />
                <ThemedText style={[styles.bodyText, { color: textColor }]}>{action}</ThemedText>
              </ThemedView>
            ))}
          </Card>
        )}

        {alert.responsiblePerson && (
          <Card>
            <ThemedText style={[styles.sectionTitle, { color: sectionTitleColor, borderBottomColor: cardBorderColor }]}>Responsible Personnel</ThemedText>
            <ThemedText style={[styles.bodyText, { color: textColor }]}>{alert.responsiblePerson}</ThemedText>
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
    borderLeftWidth: 5,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  headerIcon: {
    marginRight: 10,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    flexShrink: 1,
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
  severityBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  severityBadgeText: {
    color: '#fff', // This color contrasts well with most badge colors.
    fontSize: 13,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    paddingBottom: 5,
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
    marginTop: 3,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
});