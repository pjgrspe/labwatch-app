// app/(tabs)/alerts/[id].tsx
import Card from '@/components/Card';
import { Text as ThemedText, View as ThemedView } from '@/components/Themed';
import { ColorName } from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { auth } from '@/FirebaseConfig';
import { useThemeColor } from '@/hooks/useThemeColor';
import { AlertService } from '@/modules/alerts/services/AlertService';
import { AlertSeverity, Alert as AlertType } from '@/types/alerts';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert as RNAlert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

const severityThemeColors: { [key in AlertSeverity]: ColorName } = {
  critical: 'errorText',
  high: 'warningText',
  medium: 'infoText',
  low: 'successText',
  info: 'icon',
};

const getIconForAlertType = (type: AlertType['type']): keyof typeof Ionicons.glyphMap => {
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


export default function AlertDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [alert, setAlert] = useState<AlertType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAcknowledging, setIsAcknowledging] = useState(false);

  const scrollViewBackgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const metaTextColor = useThemeColor({}, 'icon');
  const sectionTitleColor = useThemeColor({}, 'text');
  const cardBorderColor = useThemeColor({}, 'borderColor');
  const actionIconColor = useThemeColor({}, 'tint');
  const buttonTextColor = useThemeColor({light: '#FFFFFF', dark: '#FFFFFF'}, 'text');
  const errorColor = useThemeColor({}, 'errorText');

  const severityColorNameForHook: ColorName = alert ? (severityThemeColors[alert.severity] || 'text') : 'text';
  const alertSeverityColor = useThemeColor({}, severityColorNameForHook);


  const fetchAlertDetails = useCallback(async () => {
    if (!id) {
      RNAlert.alert("Error", "Alert ID is missing.");
      setIsLoading(false);
      if (router.canGoBack()) router.back();
      return;
    }
    setIsLoading(true);
    try {
      const fetchedAlert = await AlertService.getAlertById(id);
      setAlert(fetchedAlert);
    } catch (error) {
      console.error(`Error fetching alert details for ${id}:`, error);
      RNAlert.alert("Error", "Failed to load alert details.");
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchAlertDetails();
  }, [fetchAlertDetails]);

  const handleAcknowledge = async () => {
    if (!alert || !auth.currentUser) return;
    setIsAcknowledging(true);
    try {
      await AlertService.acknowledgeAlert(alert.id, auth.currentUser.uid);
      RNAlert.alert("Acknowledged", "Alert has been acknowledged.");
      fetchAlertDetails(); // Refetch to get updated data including potential acknowledgedByName
    } catch (error) {
      console.error("Error acknowledging alert:", error);
      RNAlert.alert("Error", "Failed to acknowledge alert.");
    } finally {
      setIsAcknowledging(false);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: scrollViewBackgroundColor }]}>
        <ActivityIndicator size="large" color={actionIconColor} />
      </View>
    );
  }

  if (!alert) {
    return (
      <ThemedView style={[styles.centered, { backgroundColor: scrollViewBackgroundColor }]}>
        <Stack.Screen options={{ title: "Alert Not Found" }} />
        <ThemedText style={[styles.errorText, { color: errorColor }]}>Alert not found.</ThemedText>
      </ThemedView>
    );
  }


  return (
    <ScrollView style={[styles.scrollViewContainer, { backgroundColor: scrollViewBackgroundColor }]}>
      <Stack.Screen options={{ title: `Alert: ${alert.type.replace(/_/g, ' ')}` }} />
      <ThemedView style={styles.container}>
        <Card style={[styles.headerCard, { borderLeftColor: alertSeverityColor }]}>
          <ThemedView style={styles.titleContainer}>
            <Ionicons name={getIconForAlertType(alert.type)} size={30} color={alertSeverityColor} style={styles.headerIcon} />
            <ThemedText style={[styles.mainTitle, { color: textColor }]}>{alert.type.replace(/_/g, ' ').toUpperCase()}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.metaInfoContainer}>
            <ThemedView style={styles.metaItem}>
              <Ionicons name="cube-outline" size={16} color={metaTextColor} />
              {/* MODIFIED TO DISPLAY roomName */}
              <ThemedText style={[styles.metaText, { color: metaTextColor }]}>Room: {alert.roomName}</ThemedText>
            </ThemedView>
            {alert.sensorId &&
              <ThemedView style={styles.metaItem}>
                <Ionicons name="hardware-chip-outline" size={16} color={metaTextColor} />
                <ThemedText style={[styles.metaText, { color: metaTextColor }]}>Sensor: {alert.sensorId.substring(alert.sensorId.lastIndexOf('-') + 1)} ({alert.sensorType})</ThemedText>
              </ThemedView>
            }
            <ThemedView style={styles.metaItem}>
              <Ionicons name="time-outline" size={16} color={metaTextColor} />
              <ThemedText style={[styles.metaText, { color: metaTextColor }]}>{alert.timestamp.toLocaleString()}</ThemedText>
            </ThemedView>
             {alert.triggeringValue &&
              <ThemedView style={styles.metaItem}>
                <Ionicons name="stats-chart-outline" size={16} color={metaTextColor} />
                <ThemedText style={[styles.metaText, { color: metaTextColor }]}>Value: {alert.triggeringValue}</ThemedText>
              </ThemedView>
            }
          </ThemedView>
          <ThemedView style={[styles.severityBadge, { backgroundColor: alertSeverityColor }]}>
            <ThemedText style={styles.severityBadgeText}>{alert.severity.toUpperCase()}</ThemedText>
          </ThemedView>
        </Card>

        <Card>
          <ThemedText style={[styles.sectionTitle, { color: sectionTitleColor, borderBottomColor: cardBorderColor }]}>Message</ThemedText>
          <ThemedText style={[styles.bodyText, { color: textColor }]}>{alert.message}</ThemedText>
          {alert.details && (
            <ThemedText style={[styles.bodyText, { color: metaTextColor, marginTop: Layout.spacing.sm, fontSize: Layout.fontSize.sm }]}>
              Additional Details: {alert.details}
            </ThemedText>
          )}
        </Card>

        {alert.acknowledged && (
            <Card>
                <ThemedText style={[styles.sectionTitle, { color: sectionTitleColor, borderBottomColor: cardBorderColor }]}>Acknowledgement</ThemedText>
                <ThemedText style={[styles.bodyText, { color: textColor }]}>
                    {/* MODIFIED TO DISPLAY acknowledgedByName */}
                    Acknowledged by: {alert.acknowledgedByName || alert.acknowledgedBy || 'N/A'}
                </ThemedText>
                <ThemedText style={[styles.bodyText, { color: textColor }]}>
                    Acknowledged at: {alert.acknowledgedAt ? alert.acknowledgedAt.toLocaleString() : 'N/A'}
                </ThemedText>
            </Card>
        )}

        {!alert.acknowledged && (
          <Card>
            <ThemedText style={[styles.sectionTitle, { color: sectionTitleColor, borderBottomColor: cardBorderColor }]}>Actions</ThemedText>
            {isAcknowledging ? (
              <ActivityIndicator size="small" color={actionIconColor} style={{ marginVertical: Layout.spacing.sm }}/>
            ) : (
              <TouchableOpacity onPress={handleAcknowledge} style={[styles.acknowledgeButton, { backgroundColor: actionIconColor }]}>
                <Ionicons name="checkmark-done-circle-outline" size={20} color={buttonTextColor} style={{marginRight: Layout.spacing.sm}}/>
                <ThemedText style={[styles.acknowledgeButtonText, {color: buttonTextColor}]}>Acknowledge Alert</ThemedText>
              </TouchableOpacity>
            )}
          </Card>
        )}

      </ThemedView>
    </ScrollView>
  );
}

// Styles remain the same as provided in the prompt for this file
const styles = StyleSheet.create({
  scrollViewContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: Layout.spacing.md,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCard: {
    marginBottom: Layout.spacing.lg,
    borderLeftWidth: 5,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
    backgroundColor: 'transparent',
  },
  headerIcon: {
    marginRight: Layout.spacing.md,
  },
  mainTitle: {
    fontSize: Layout.fontSize.xl,
    fontWeight: Layout.fontWeight.bold,
    flexShrink: 1,
  },
  metaInfoContainer: {
    marginBottom: Layout.spacing.md,
    backgroundColor: 'transparent',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.xs,
    backgroundColor: 'transparent',
  },
  metaText: {
    fontSize: Layout.fontSize.sm,
    marginLeft: Layout.spacing.sm,
  },
  severityBadge: {
    paddingVertical: Layout.spacing.xs,
    paddingHorizontal: Layout.spacing.md,
    borderRadius: Layout.borderRadius.pill,
    alignSelf: 'flex-start',
    marginBottom: Layout.spacing.sm,
  },
  severityBadgeText: {
    color: '#fff',
    fontSize: Layout.fontSize.sm -1,
    fontWeight: Layout.fontWeight.semibold,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: Layout.fontWeight.semibold,
    marginBottom: Layout.spacing.md,
    paddingBottom: Layout.spacing.xs,
    borderBottomWidth: 1,
  },
  bodyText: {
    fontSize: Layout.fontSize.md,
    lineHeight: Layout.fontSize.md * 1.5,
    marginBottom: Layout.spacing.xs,
  },
  acknowledgeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.md,
    marginTop: Layout.spacing.sm,
  },
  acknowledgeButtonText: {
    fontSize: Layout.fontSize.md,
    fontWeight: Layout.fontWeight.medium,
  },
  errorText: {
    fontSize: Layout.fontSize.lg,
    textAlign: 'center',
  },
});