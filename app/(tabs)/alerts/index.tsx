// Modified app/(tabs)/alerts/index.tsx
import Card from '@/components/Card';
import { Text as ThemedText, View as ThemedView } from '@/components/Themed';
import { ColorName, Colors } from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { useThemeColor } from '@/hooks/useThemeColor';
import { AlertService } from '@/modules/alerts/services/AlertService';
import { Alert as AlertInterface, AlertSeverity, AlertType as AlertTypeStrings } from '@/types/alerts';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';

const severityThemeColors: { [key in AlertSeverity]: ColorName } = {
  critical: 'errorText',
  high: 'warningText',
  medium: 'infoText',
  low: 'successText',
  info: 'icon',
};

const getIconForAlertType = (type: AlertTypeStrings): keyof typeof Ionicons.glyphMap => {
  switch (type) {
    case 'high_temperature':
    case 'low_temperature':
    case 'thermal_anomaly':
      return 'thermometer-outline';
    case 'high_humidity':
    case 'low_humidity':
      return 'water-outline';
    case 'poor_air_quality_pm25':
    case 'poor_air_quality_pm10':
      return 'cloud-outline';
    case 'high_vibration':
      return 'pulse-outline';
    case 'equipment_offline':
      return 'power-outline';
    case 'equipment_malfunction':
      return 'build-outline';
    case 'connection_lost':
      return 'cloud-offline-outline';
    case 'maintenance_due':
      return 'construct-outline';
    case 'test_alert':
      return 'bug-outline';
    default:
      return 'alert-circle-outline';
  }
};


const AlertItem: React.FC<{ item: AlertInterface }> = ({ item }) => {
  const router = useRouter();
  const itemSeverityColor = useThemeColor({}, severityThemeColors[item.severity] || 'text');
  const alertTypeColor = useThemeColor({}, 'text');
  const alertTimeColor = useThemeColor({}, 'icon');
  const alertLocationColor = useThemeColor({}, 'text');
  const alertDetailsColor = useThemeColor({}, 'icon');
  const acknowledgedColor = useThemeColor({}, 'successText');
  const unacknowledgedColor = useThemeColor({}, 'warningText');

  const timeString = item.timestamp instanceof Date
    ? item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : (item.timestamp && 'seconds' in item.timestamp)
      ? new Date((item.timestamp as any).seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : 'N/A';

  const acknowledgedAtString = item.acknowledgedAt instanceof Date
    ? item.acknowledgedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : (item.acknowledgedAt && 'seconds' in item.acknowledgedAt)
      ? new Date((item.acknowledgedAt as any).seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : 'N/A';


  return (
    <TouchableOpacity onPress={() => router.push(`/(tabs)/alerts/${item.id}` as any)}>
      <Card style={[styles.alertCard, { borderLeftColor: item.acknowledged ? Colors.light.borderColor : itemSeverityColor }]}>
        <ThemedView style={styles.alertHeader}>
          <Ionicons name={getIconForAlertType(item.type)} size={24} color={item.acknowledged ? acknowledgedColor : itemSeverityColor} style={styles.alertIcon} />
          <ThemedText style={[styles.alertType, { color: alertTypeColor }]} numberOfLines={1}>{item.message.split(':')[0] || item.type.replace(/_/g, ' ')}</ThemedText>
          <ThemedText style={[styles.alertTime, { color: alertTimeColor }]}>
            {item.timestamp instanceof Date
              ? item.timestamp.toLocaleDateString()
              : (item.timestamp && 'seconds' in item.timestamp)
                ? new Date((item.timestamp as any).seconds * 1000).toLocaleDateString()
                : ''
            } {timeString}
          </ThemedText>
        </ThemedView>
        <ThemedText style={[styles.alertLocation, { color: alertLocationColor }]}>
          {/* MODIFIED TO DISPLAY roomName */}
          {item.roomName}
          {item.sensorId ? ` - Sensor: ${item.sensorId.substring(item.sensorId.lastIndexOf('-') + 1)}` : ''}
        </ThemedText>
        <ThemedText style={[styles.alertDetails, { color: alertDetailsColor }]} numberOfLines={2}>
          {item.message}
        </ThemedText>
        <ThemedView style={styles.statusContainer}>
          <ThemedText style={[styles.severityText, { color: itemSeverityColor }]}>
            Severity: {item.severity.toUpperCase()}
          </ThemedText>
          <ThemedText style={[styles.ackStatus, { color: item.acknowledged ? acknowledgedColor : unacknowledgedColor }]}>
            {/* MODIFIED TO DISPLAY acknowledgedByName */}
            {item.acknowledged ? `Ack by ${item.acknowledgedByName || item.acknowledgedBy || 'N/A'} @ ${acknowledgedAtString}` : 'NEEDS ACKNOWLEDGEMENT'}
          </ThemedText>
        </ThemedView>
      </Card>
    </TouchableOpacity>
  );
};

export default function AlertsListScreen() {
  const [alerts, setAlerts] = useState<AlertInterface[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const containerBackgroundColor = useThemeColor({}, 'background');
  const activityIndicatorColor = useThemeColor({}, 'tint');
  const emptyStateTextColor = useThemeColor({}, 'text');
  const emptyStateIconColor = useThemeColor({}, 'successText');

  const fetchAlerts = async () => {
    setRefreshing(true); // Ensure refreshing is true when explicitly fetching
    try {
      const fetchedAlerts = await AlertService.getAlerts();
      setAlerts(fetchedAlerts);
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
    } finally {
      setRefreshing(false);
      setIsLoading(false); // Ensure loading is false after fetch
    }
  };

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = AlertService.onAlertsUpdate(
      (updatedAlerts) => {
        setAlerts(updatedAlerts);
        if (isLoading) setIsLoading(false);
        if (refreshing) setRefreshing(false); // Stop refreshing if it was a pull-to-refresh
      },
      (error) => {
        console.error("Error listening to alert updates:", error);
         if (isLoading) setIsLoading(false);
         if (refreshing) setRefreshing(false);
      }
    );
    return () => unsubscribe();
  }, []); // Removed refreshing from dependencies to avoid re-subscription on pull-to-refresh


  const onRefresh = React.useCallback(() => {
    fetchAlerts();
  }, []);


  if (isLoading && !refreshing) {
    return (
      <View style={[styles.centered, { backgroundColor: containerBackgroundColor }]}>
        <ActivityIndicator size="large" color={activityIndicatorColor} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'All Alerts' }} />
      <ThemedView style={[styles.container, { backgroundColor: containerBackgroundColor }]}>
        {alerts.length === 0 ? (
          <View style={styles.centered}>
            <Ionicons name="checkmark-circle-outline" size={60} color={emptyStateIconColor} />
            <ThemedText style={[styles.emptyText, {color: emptyStateTextColor}]}>No alerts at the moment. All clear!</ThemedText>
          </View>
        ) : (
          <FlatList
            data={alerts}
            renderItem={({ item }) => <AlertItem item={item} />}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={activityIndicatorColor} />
            }
          />
        )}
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.lg,
  },
  emptyText: {
    marginTop: Layout.spacing.md,
    fontSize: Layout.fontSize.lg,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: Layout.spacing.md,
    paddingTop: Layout.spacing.sm,
    paddingBottom: Layout.spacing.md,
  },
  alertCard: {
    borderLeftWidth: 5,
    marginBottom: Layout.spacing.md,
    padding: Layout.spacing.md,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.xs,
    backgroundColor: 'transparent',
  },
  alertIcon: {
    marginRight: Layout.spacing.sm,
  },
  alertType: {
    fontSize: Layout.fontSize.lg,
    fontWeight: Layout.fontWeight.semibold,
    flex: 1,
    textTransform: 'capitalize',
  },
  alertTime: {
    fontSize: Layout.fontSize.xs,
  },
  alertLocation: {
    fontSize: Layout.fontSize.md,
    marginBottom: Layout.spacing.xs,
    marginLeft: Layout.spacing.sm + 24, // Aligns with text after icon
  },
  alertDetails: {
    fontSize: Layout.fontSize.sm,
    marginLeft: Layout.spacing.sm + 24, // Aligns with text after icon
    marginBottom: Layout.spacing.sm,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Layout.spacing.sm,
    paddingTop: Layout.spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.light.borderColor, // Consider theming this
    backgroundColor: 'transparent',
    marginLeft: Layout.spacing.sm + 24, // Aligns with text after icon
  },
  severityText: {
    fontSize: Layout.fontSize.xs,
    fontWeight: Layout.fontWeight.medium,
  },
  ackStatus: {
    fontSize: Layout.fontSize.xs,
    fontStyle: 'italic',
  },
});