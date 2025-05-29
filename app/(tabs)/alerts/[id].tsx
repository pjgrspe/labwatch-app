// app/(tabs)/alerts/[id].tsx
import { Card, ThemedText, ThemedView } from '@/components';
import { ColorName, Layout } from '@/constants';
import { auth } from '@/FirebaseConfig';
import { useCurrentTheme, useThemeColor } from '@/hooks';
import { AlertService } from '@/modules/alerts/services/AlertService';
import { AlertSeverity, Alert as AlertType } from '@/types/alerts';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert as RNAlert, RefreshControl, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

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

const getSeverityIcon = (severity: AlertSeverity): keyof typeof Ionicons.glyphMap => {
  switch (severity) {
    case 'critical': return 'alert-circle';
    case 'high': return 'warning';
    case 'medium': return 'information-circle';
    case 'low': return 'checkmark-circle';
    case 'info': return 'help-circle';
    default: return 'help-circle';
  }
};

const getSeverityDescription = (severity: AlertSeverity): string => {
  switch (severity) {
    case 'critical': return 'Immediate attention required';
    case 'high': return 'Urgent response needed';
    case 'medium': return 'Monitor and respond soon';
    case 'low': return 'Low priority monitoring';
    case 'info': return 'Informational notice';
    default: return 'Unknown severity';
  }
};

const getAlertTypeDescription = (type: AlertType['type']): string => {
  switch (type) {
    case 'high_temperature': return 'Temperature exceeded safe operating limits';
    case 'low_temperature': return 'Temperature dropped below minimum threshold';
    case 'thermal_anomaly': return 'Unusual temperature patterns detected';
    case 'high_humidity': return 'Humidity levels exceeded recommended range';
    case 'low_humidity': return 'Humidity levels below optimal range';
    case 'poor_air_quality_pm25': return 'PM2.5 particles exceed healthy levels';
    case 'poor_air_quality_pm10': return 'PM10 particles exceed safe limits';
    case 'high_vibration': return 'Excessive vibration detected in equipment';
    case 'equipment_offline': return 'Equipment has gone offline unexpectedly';
    case 'equipment_malfunction': return 'Equipment malfunction or error detected';
    case 'connection_lost': return 'Network connection to sensor lost';
    case 'maintenance_due': return 'Scheduled maintenance is overdue';
    case 'test_alert': return 'System test alert for verification';
    default: return 'Alert condition detected';
  }
};

const formatTimeAgo = (timestamp: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - timestamp.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return timestamp.toLocaleDateString();
};

export default function AlertDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [alert, setAlert] = useState<AlertType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAcknowledging, setIsAcknowledging] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const currentTheme = useCurrentTheme();
  const scrollViewBackgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const metaTextColor = useThemeColor({}, 'icon');
  const sectionTitleColor = useThemeColor({}, 'text');
  const cardBorderColor = useThemeColor({}, 'borderColor');
  const actionIconColor = useThemeColor({}, 'tint');
  const buttonTextColor = useThemeColor({light: '#FFFFFF', dark: '#FFFFFF'}, 'text');
  const errorColor = useThemeColor({}, 'errorText');
  const successColor = useThemeColor({}, 'successText');
  const surfaceColor = useThemeColor({}, 'tabIconDefault');

  const severityColorNameForHook: ColorName = alert ? (severityThemeColors[alert.severity] || 'text') : 'text';
  const alertSeverityColor = useThemeColor({}, severityColorNameForHook);

  const fetchAlertDetails = useCallback(async (isRefresh: boolean = false) => {
    if (!id) {
      RNAlert.alert("Error", "Alert ID is missing.");
      if (!isRefresh) setIsLoading(false);
      setRefreshing(false);
      if (router.canGoBack()) router.back();
      return;
    }
    if (!isRefresh) setIsLoading(true);
    try {
      const fetchedAlert = await AlertService.getAlertById(id);
      setAlert(fetchedAlert);
    } catch (error) {
      console.error(`Error fetching alert details for ${id}:`, error);
      RNAlert.alert("Error", "Failed to load alert details.");
    } finally {
      if (!isRefresh) setIsLoading(false);
      setRefreshing(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchAlertDetails(false);
  }, [fetchAlertDetails]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAlertDetails(true);
  }, [fetchAlertDetails]);

  const handleAcknowledge = async () => {
    if (!alert || !auth.currentUser) return;
    setIsAcknowledging(true);
    try {
      await AlertService.acknowledgeAlert(alert.id, auth.currentUser.uid);
      RNAlert.alert("Acknowledged", "Alert has been acknowledged.");
      fetchAlertDetails(false);
    } catch (error) {
      console.error("Error acknowledging alert:", error);
      RNAlert.alert("Error", "Failed to acknowledge alert.");
    } finally {
      setIsAcknowledging(false);
    }
  };

  const handleCreateIncident = () => {
    RNAlert.alert("Create Incident", "This will create an incident report based on this alert.");
  };

  const handleCallEmergency = () => {
    RNAlert.alert("Emergency", "This will initiate emergency procedures.");
  };

  const getSeverityBadgeStyle = (severity: AlertSeverity) => {
    return {
      ...styles.severityBadge,
      backgroundColor: `${alertSeverityColor}15`,
      borderWidth: 1,
      borderColor: alertSeverityColor,
    };
  };

  const formatAlertTitle = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isLoading && !refreshing) {
    return (
      <ThemedView style={[styles.centered, { backgroundColor: scrollViewBackgroundColor }]}>
        <ActivityIndicator size="large" color={actionIconColor} />
        <ThemedText style={{ color: textColor, marginTop: Layout.spacing.md, fontFamily: 'Montserrat-Regular' }}>
          Loading alert details...
        </ThemedText>
      </ThemedView>
    );
  }

  if (!alert) {
    return (
      <ThemedView style={[styles.centered, { backgroundColor: scrollViewBackgroundColor }]}>
        <Stack.Screen options={{ title: "Alert Not Found" }} />
        <Ionicons name="alert-circle-outline" size={64} color={metaTextColor} />
        <ThemedText style={[styles.errorText, { color: errorColor, marginTop: Layout.spacing.md }]}>
          Alert not found or has been removed.
        </ThemedText>
        <TouchableOpacity
          style={[styles.customButton, { backgroundColor: actionIconColor, marginTop: Layout.spacing.lg }]}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ThemedText style={[styles.customButtonText, { color: buttonTextColor }]}>Go Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ 
        title: 'Alert Details'
      }} />
      
      <ScrollView 
        style={[styles.scrollViewContainer, { backgroundColor: scrollViewBackgroundColor }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={actionIconColor} />}
        contentContainerStyle={styles.scrollContentContainer}
      >
        <ThemedView style={styles.container}>
          
          {/* Alert Header Card */}
          <Card style={styles.headerCard}>
            <ThemedView style={styles.headerContent}>
              {/* Status Indicator Bar */}
              <ThemedView style={[styles.statusBar, { backgroundColor: `${alertSeverityColor}20` }]}>
                <ThemedView style={styles.statusBarContent}>
                  <ThemedView style={styles.severitySection}>
                    <Ionicons 
                      name={getSeverityIcon(alert.severity)} 
                      size={24} 
                      color={alertSeverityColor} 
                    />
                    <ThemedView style={styles.severityInfo}>
                      <ThemedText style={[styles.severityText, { color: alertSeverityColor }]}>
                        {alert.severity.toUpperCase()}
                      </ThemedText>
                      <ThemedText style={[styles.severityDescription, { color: metaTextColor }]}>
                        {getSeverityDescription(alert.severity)}
                      </ThemedText>
                    </ThemedView>
                  </ThemedView>
                  
                  {alert.acknowledged && (
                    <ThemedView style={styles.statusIndicator}>
                      <Ionicons name="checkmark-circle" size={20} color={successColor} />
                      <ThemedText style={[styles.statusText, { color: successColor }]}>
                        Acknowledged
                      </ThemedText>
                    </ThemedView>
                  )}
                </ThemedView>
              </ThemedView>
              
              {/* Alert Title */}
              <ThemedView style={styles.titleSection}>
                <ThemedText style={[styles.alertTitle, { color: textColor }]}>
                  {formatAlertTitle(alert.type)}
                </ThemedText>
                <ThemedText style={[styles.alertDescription, { color: metaTextColor }]}>
                  {getAlertTypeDescription(alert.type)}
                </ThemedText>
              </ThemedView>

              {/* Key Metrics */}
              <ThemedView style={styles.metricsContainer}>
                <ThemedView style={styles.metricRow}>
                  <ThemedView style={[styles.metricItem, { backgroundColor: `${surfaceColor}10` }]}>
                    <Ionicons name="cube-outline" size={16} color={metaTextColor} />
                    <ThemedView style={styles.metricContent}>
                      <ThemedText style={[styles.metricLabel, { color: metaTextColor }]}>Location</ThemedText>
                      <ThemedText style={[styles.metricValue, { color: textColor }]}>
                        {alert.roomName}
                      </ThemedText>
                    </ThemedView>
                  </ThemedView>
                  
                  <ThemedView style={[styles.metricItem, { backgroundColor: `${surfaceColor}10` }]}>
                    <Ionicons name="time-outline" size={16} color={metaTextColor} />
                    <ThemedView style={styles.metricContent}>
                      <ThemedText style={[styles.metricLabel, { color: metaTextColor }]}>Time</ThemedText>
                      <ThemedText style={[styles.metricValue, { color: textColor }]}>
                        {formatTimeAgo(alert.timestamp)}
                      </ThemedText>
                    </ThemedView>
                  </ThemedView>
                </ThemedView>

                {alert.triggeringValue && (
                  <ThemedView style={[styles.highlightMetric, { 
                    backgroundColor: `${alertSeverityColor}10`,
                    borderColor: `${alertSeverityColor}30`
                  }]}>
                    <Ionicons name="trending-up" size={20} color={alertSeverityColor} />
                    <ThemedView style={styles.metricContent}>
                      <ThemedText style={[styles.metricLabel, { color: alertSeverityColor }]}>Triggering Value</ThemedText>
                      <ThemedText style={[styles.highlightValue, { color: alertSeverityColor }]}>
                        {alert.triggeringValue}
                      </ThemedText>
                    </ThemedView>
                  </ThemedView>
                )}
              </ThemedView>

              {/* Action Button */}
              {!alert.acknowledged && (
                <TouchableOpacity
                  style={[styles.primaryAction, { backgroundColor: successColor }]}
                  onPress={handleAcknowledge}
                  disabled={isAcknowledging}
                  activeOpacity={0.7}
                >
                  {isAcknowledging ? (
                    <ActivityIndicator size="small" color={buttonTextColor} />
                  ) : (
                    <>
                      <Ionicons name="checkmark-done-circle-outline" size={20} color={buttonTextColor} />
                      <ThemedText style={[styles.primaryActionText, { color: buttonTextColor }]}>
                        Acknowledge Alert
                      </ThemedText>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </ThemedView>
          </Card>

          {/* Technical Details Card */}
          <Card>
            <ThemedText style={[styles.sectionTitle, { color: sectionTitleColor }]}>
              <Ionicons name="information-circle-outline" size={20} color={sectionTitleColor} /> Technical Details
            </ThemedText>
            
            <ThemedView style={styles.detailsGrid}>
              <ThemedView style={styles.detailRow}>
                <ThemedView style={styles.detailItem}>
                  <ThemedView style={styles.detailHeader}>
                    <Ionicons name="calendar-outline" size={18} color={metaTextColor} />
                    <ThemedText style={[styles.detailLabel, { color: metaTextColor }]}>Date & Time</ThemedText>
                  </ThemedView>
                  <ThemedText style={[styles.detailValue, { color: textColor }]}>
                    {alert.timestamp.toLocaleString()}
                  </ThemedText>
                  <ThemedText style={[styles.detailSubvalue, { color: metaTextColor }]}>
                    {formatTimeAgo(alert.timestamp)}
                  </ThemedText>
                </ThemedView>
              </ThemedView>

              <ThemedView style={styles.detailRow}>
                <ThemedView style={styles.detailItem}>
                  <ThemedView style={styles.detailHeader}>
                    <Ionicons name={getIconForAlertType(alert.type)} size={18} color={metaTextColor} />
                    <ThemedText style={[styles.detailLabel, { color: metaTextColor }]}>Alert Type</ThemedText>
                  </ThemedView>
                  <ThemedText style={[styles.detailValue, { color: textColor }]}>
                    {formatAlertTitle(alert.type)}
                  </ThemedText>
                  <ThemedText style={[styles.detailSubvalue, { color: metaTextColor }]}>
                    {alert.type}
                  </ThemedText>
                </ThemedView>
              </ThemedView>

              {alert.sensorId && (
                <ThemedView style={styles.detailRow}>
                  <ThemedView style={styles.detailItem}>
                    <ThemedView style={styles.detailHeader}>
                      <Ionicons name="hardware-chip-outline" size={18} color={metaTextColor} />
                      <ThemedText style={[styles.detailLabel, { color: metaTextColor }]}>Sensor Information</ThemedText>
                    </ThemedView>
                    <ThemedText style={[styles.detailValue, { color: textColor }]}>
                      {alert.sensorId.substring(alert.sensorId.lastIndexOf('-') + 1)}
                    </ThemedText>
                    <ThemedText style={[styles.detailSubvalue, { color: metaTextColor }]}>
                      {alert.sensorType} • ID: {alert.sensorId}
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
              )}

              <ThemedView style={styles.detailRow}>
                <ThemedView style={styles.detailItem}>
                  <ThemedView style={styles.detailHeader}>
                    <Ionicons name="location-outline" size={18} color={metaTextColor} />
                    <ThemedText style={[styles.detailLabel, { color: metaTextColor }]}>Location</ThemedText>
                  </ThemedView>
                  <ThemedText style={[styles.detailValue, { color: textColor }]}>
                    {alert.roomName}
                  </ThemedText>
                  <ThemedText style={[styles.detailSubvalue, { color: metaTextColor }]}>
                    Laboratory Environment
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            </ThemedView>
          </Card>

          {/* Alert Message Card */}
          <Card>
            <ThemedText style={[styles.sectionTitle, { color: sectionTitleColor }]}>
              <Ionicons name="document-text-outline" size={20} color={sectionTitleColor} /> Alert Message
            </ThemedText>
            
            <ThemedView style={styles.messageContainer}>
              <ThemedView style={[styles.messageIconContainer, { backgroundColor: `${alertSeverityColor}15` }]}>
                <Ionicons name={getIconForAlertType(alert.type)} size={28} color={alertSeverityColor} />
              </ThemedView>
              <ThemedView style={styles.messageContent}>
                <ThemedText style={[styles.messageText, { color: textColor }]}>
                  {alert.message}
                </ThemedText>
                
                {alert.details && (
                  <ThemedView style={[styles.detailsContainer, { backgroundColor: `${surfaceColor}10` }]}>
                    <ThemedText style={[styles.detailsLabel, { color: metaTextColor }]}>
                      Additional Details:
                    </ThemedText>
                    <ThemedText style={[styles.detailsText, { color: textColor }]}>
                      {alert.details}
                    </ThemedText>
                  </ThemedView>
                )}
              </ThemedView>
            </ThemedView>
          </Card>

          {/* Acknowledgement Card */}
          {alert.acknowledged && (
            <Card>
              <ThemedText style={[styles.sectionTitle, { color: sectionTitleColor }]}>
                <Ionicons name="checkmark-circle-outline" size={20} color={successColor} /> Acknowledgement Status
              </ThemedText>
              
              <ThemedView style={[styles.acknowledgementContainer, { backgroundColor: `${successColor}10` }]}>
                <ThemedView style={[styles.acknowledgementIcon, { backgroundColor: successColor }]}>
                  <Ionicons name="checkmark" size={20} color={buttonTextColor} />
                </ThemedView>
                <ThemedView style={styles.acknowledgementContent}>
                  <ThemedText style={[styles.acknowledgementTitle, { color: textColor }]}>
                    Alert Acknowledged
                  </ThemedText>
                  <ThemedText style={[styles.acknowledgementBy, { color: metaTextColor }]}>
                    By: {alert.acknowledgedByName || alert.acknowledgedBy || 'Unknown User'}
                  </ThemedText>
                  <ThemedText style={[styles.acknowledgementTime, { color: metaTextColor }]}>
                    {alert.acknowledgedAt ? alert.acknowledgedAt.toLocaleString() : 'Time not available'}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            </Card>
          )}

          {/* Actions Card */}
          <Card>
            <ThemedText style={[styles.sectionTitle, { color: sectionTitleColor }]}>
              <Ionicons name="options-outline" size={20} color={sectionTitleColor} /> Available Actions
            </ThemedText>
            
            <ThemedView style={styles.actionsGrid}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: actionIconColor }]}
                onPress={handleCreateIncident}
                activeOpacity={0.7}
              >
                <Ionicons name="document-text-outline" size={24} color={buttonTextColor} />
                <ThemedText style={[styles.actionButtonTitle, { color: buttonTextColor }]}>
                  Create Incident
                </ThemedText>
                <ThemedText style={[styles.actionButtonSubtitle, { color: `${buttonTextColor}90` }]}>
                  Generate incident report
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.emergencyButton, { backgroundColor: errorColor }]}
                onPress={handleCallEmergency}
                activeOpacity={0.7}
              >
                <Ionicons name="call-outline" size={24} color={buttonTextColor} />
                <ThemedText style={[styles.actionButtonTitle, { color: buttonTextColor }]}>
                  Emergency Call
                </ThemedText>
                <ThemedText style={[styles.actionButtonSubtitle, { color: `${buttonTextColor}90` }]}>
                  Contact emergency services
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </Card>

        </ThemedView>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scrollViewContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    paddingBottom: Layout.spacing.xl,
  },
  container: {
    flex: 1,
    padding: Layout.spacing.md,
    backgroundColor: 'transparent',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.lg,
    backgroundColor: 'transparent',
  },
  
  // Header Card Styles
  headerCard: {
    marginBottom: Layout.spacing.lg,
    padding: 0,
    overflow: 'hidden',
  },
  headerContent: {
    backgroundColor: 'transparent',
  },
  statusBar: {
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
  },
  statusBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  severitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
    backgroundColor: 'transparent',
  },
  severityInfo: {
    backgroundColor: 'transparent',
  },
  severityText: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Bold',
    letterSpacing: 1,
  },
  severityDescription: {
    fontSize: Layout.fontSize.xs,
    fontFamily: 'Montserrat-Regular',
    marginTop: 2,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.xs,
    backgroundColor: 'transparent',
  },
  statusText: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Medium',
  },
  
  titleSection: {
    paddingHorizontal: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
    backgroundColor: 'transparent',
  },
  alertTitle: {
    fontSize: Layout.fontSize.xxl,
    fontFamily: 'Montserrat-Bold',
    marginBottom: Layout.spacing.xs,
    lineHeight: Layout.fontSize.xxl * 1.2,
  },
  alertDescription: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Regular',
    lineHeight: Layout.fontSize.md * 1.3,
  },
  
  // Metrics Styles
  metricsContainer: {
    paddingHorizontal: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
    backgroundColor: 'transparent',
  },
  metricRow: {
    flexDirection: 'row',
    gap: Layout.spacing.sm,
    marginBottom: Layout.spacing.sm,
    backgroundColor: 'transparent',
  },
  metricItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
    padding: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.md,
  },
  metricContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  metricLabel: {
    fontSize: Layout.fontSize.xs,
    fontFamily: 'Montserrat-Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-SemiBold',
    marginTop: 2,
  },
  highlightMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
  },
  highlightValue: {
    fontSize: Layout.fontSize.lg,
    fontFamily: 'Montserrat-Bold',
    marginTop: 2,
  },
  
  primaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Layout.spacing.sm,
    margin: Layout.spacing.md,
    paddingVertical: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    minHeight: 48,
  },
  primaryActionText: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-SemiBold',
  },
  
  // Section Styles
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.xs,
    fontSize: Layout.fontSize.lg,
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: Layout.spacing.lg,
  },
  
  // Details Grid Styles
  detailsGrid: {
    gap: Layout.spacing.lg,
    backgroundColor: 'transparent',
  },
  detailRow: {
    backgroundColor: 'transparent',
  },
  detailItem: {
    backgroundColor: 'transparent',
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.xs,
    marginBottom: Layout.spacing.sm,
    backgroundColor: 'transparent',
  },
  detailLabel: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: Layout.fontSize.lg,
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: Layout.spacing.xs,
  },
  detailSubvalue: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
  },
  
  // Message Styles
  messageContainer: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
    backgroundColor: 'transparent',
  },
  messageIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  messageText: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Regular',
    lineHeight: Layout.fontSize.md * 1.4,
    marginBottom: Layout.spacing.sm,
  },
  detailsContainer: {
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    marginTop: Layout.spacing.sm,
  },
  detailsLabel: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Medium',
    marginBottom: Layout.spacing.xs,
  },
  detailsText: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
    lineHeight: Layout.fontSize.sm * 1.4,
  },
  
  // Acknowledgement Styles
  acknowledgementContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.md,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
  },
  acknowledgementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acknowledgementContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  acknowledgementTitle: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: Layout.spacing.xs,
  },
  acknowledgementBy: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Medium',
    marginBottom: 2,
  },
  acknowledgementTime: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
  },
  
  // Actions Styles
  actionsGrid: {
    gap: Layout.spacing.md,
    backgroundColor: 'transparent',
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.lg,
    paddingHorizontal: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    minHeight: 80,
  },
  emergencyButton: {
    // Additional styling for emergency button if needed
  },
  actionButtonTitle: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-SemiBold',
    marginTop: Layout.spacing.xs,
  },
  actionButtonSubtitle: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
    marginTop: 2,
    textAlign: 'center',
  },
  
  // Legacy styles for compatibility
  severityBadge: {
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.lg,
    alignSelf: 'flex-start',
    marginBottom: Layout.spacing.xs,
  },
  customButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.sm + 2,
    paddingHorizontal: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    minHeight: 44,
  },
  customButtonText: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-SemiBold',
  },
  errorText: {
    fontSize: Layout.fontSize.lg,
    fontFamily: 'Montserrat-Medium',
    textAlign: 'center',
  },
});