import { Card, ThemedText, ThemedView } from '@/components';
import { ColorName, Layout } from '@/constants';
import { useThemeColor } from '@/hooks';
import { Incident } from '@/types/incidents';
import { deleteIncident, getIncidentById } from '@/utils/firebaseUtils';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

// Define severity colors based on your Colors.ts structure
const getSeverityColorName = (severity: Incident['severity']): ColorName => {
  switch (severity) {
    case 'critical':
    case 'high':
      return 'errorText';
    case 'medium':
      return 'warningText';
    case 'low':
      return 'successText';
    case 'info':
      return 'infoText';
    default:
      return 'text';
  }
};

// Define status colors based on your Colors.ts structure
const getStatusColorName = (status: string): ColorName => {
  switch (status) {
    case 'open': 
      return 'errorText'; // Red for open issues
    case 'in_progress': 
      return 'warningText'; // Orange/yellow for in progress
    case 'resolved': 
      return 'successText'; // Green for resolved
    case 'closed': 
      return 'infoText'; // Blue for closed
    default: 
      return 'text';
  }
};

// Helper function to get status icon
const getStatusIcon = (status: string): keyof typeof Ionicons.glyphMap => {
  switch (status) {
    case 'open': return 'alert-circle-outline';
    case 'in_progress': return 'hourglass-outline';
    case 'resolved': return 'checkmark-circle-outline';
    case 'closed': return 'checkbox-outline';
    default: return 'help-circle-outline';
  }
};

// Helper function to format time ago
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

export default function IncidentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // Get all theme colors upfront to maintain hook order consistency
  const scrollViewBackgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const metaTextColor = useThemeColor({}, 'icon');
  const sectionTitleColor = useThemeColor({}, 'text');
  const cardBorderColor = useThemeColor({}, 'borderColor');
  const actionIconColor = useThemeColor({}, 'successText');
  const errorTextColor = useThemeColor({}, 'errorText');
  const tintColor = useThemeColor({}, 'tint');
  const cardBackgroundColor = useThemeColor({}, 'cardBackground');
  const surfaceColor = useThemeColor({}, 'tabIconDefault');
  const buttonTextColor = useThemeColor({light: '#FFFFFF', dark: '#FFFFFF'}, 'text');
  
  // Pre-fetch all potential severity colors to maintain consistent hook ordering
  const errorSeverityColor = useThemeColor({}, 'errorText');
  const warningSeverityColor = useThemeColor({}, 'warningText');
  const successSeverityColor = useThemeColor({}, 'successText');
  const infoSeverityColor = useThemeColor({}, 'infoText');

  // Pre-fetch all potential status colors to maintain consistent hook ordering
  const errorStatusColor = useThemeColor({}, 'errorText');
  const warningStatusColor = useThemeColor({}, 'warningText');
  const successStatusColor = useThemeColor({}, 'successText');
  const infoStatusColor = useThemeColor({}, 'infoText');

  const fetchIncidentDetails = useCallback(async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const fetchedIncident = await getIncidentById(id);
      setIncident(fetchedIncident);
    } catch (error) {
      console.error("Failed to fetch incident details:", error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  // Replace the existing useEffect with useFocusEffect
  useFocusEffect(
    useCallback(() => {
      fetchIncidentDetails();
    }, [fetchIncidentDetails])
  );

  const handleDeleteIncident = () => {
    if (!incident) return;
    Alert.alert(
      "Delete Incident",
      `Are you sure you want to delete incident "${incident.title}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setIsDeleting(true);
              await deleteIncident(incident.id);
              Alert.alert("Success", "Incident deleted successfully.");
              router.back();
            } catch (error) {
              Alert.alert("Error", "Failed to delete incident. Please try again.");
              console.error("Error deleting incident:", error);
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  // Get the severity color based on the incident (if available)
  const getSeverityColorForIncident = (incident: Incident | null) => {
    if (!incident) return textColor;
    
    switch (getSeverityColorName(incident.severity)) {
      case 'errorText': return errorSeverityColor;
      case 'warningText': return warningSeverityColor;
      case 'successText': return successSeverityColor;
      case 'infoText': return infoSeverityColor;
      default: return textColor;
    }
  };

  // Get the status color based on the incident (if available)
  const getStatusColorForIncident = (incident: Incident | null) => {
    if (!incident) return textColor;
    
    switch (getStatusColorName(incident.status)) {
      case 'errorText': return errorStatusColor;
      case 'warningText': return warningStatusColor;
      case 'successText': return successStatusColor;
      case 'infoText': return infoStatusColor;
      default: return textColor;
    }
  };

  // Determine the severity color
  const incidentSeverityColor = getSeverityColorForIncident(incident);
  const incidentStatusColor = getStatusColorForIncident(incident);


  if (isLoading) {
    return (
      <ThemedView style={[styles.centered, { backgroundColor: scrollViewBackgroundColor}]}>
        <ActivityIndicator size="large" color={tintColor} />
        <ThemedText style={{ color: textColor, marginTop: Layout.spacing.md, fontFamily: 'Montserrat-Regular' }}>
          Loading incident details...
        </ThemedText>
      </ThemedView>
    );
  }

  if (!incident) {
    return (
      <ThemedView style={[styles.centered, { backgroundColor: scrollViewBackgroundColor }]}>
        <Stack.Screen options={{ title: "Incident Not Found" }} />
        <Ionicons name="alert-circle-outline" size={64} color={errorTextColor} />
        <ThemedText style={[styles.errorText, { color: errorTextColor }]}>Incident not found or ID is missing.</ThemedText>
        <TouchableOpacity
          style={[styles.customButton, { backgroundColor: tintColor, marginTop: Layout.spacing.lg }]}
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
      <Stack.Screen
        options={{
          title: `Incident Details`,
        }}
      />
      <ScrollView 
        style={[styles.scrollViewContainer, { backgroundColor: scrollViewBackgroundColor }]}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView style={styles.container}>
          {/* Incident Header Card */}
          <Card style={styles.headerCard}>
            <ThemedView style={styles.headerContent}>
              {/* Status Indicator Bar */}
              <ThemedView style={[styles.statusBar, { backgroundColor: `${incidentSeverityColor}20` }]}>
                <ThemedView style={styles.statusBarContent}>
                  <ThemedView style={styles.severitySection}>
                    <Ionicons 
                      name={getStatusIcon(incident.status)} 
                      size={24} 
                      color={incidentSeverityColor} 
                    />
                    <ThemedView style={styles.severityInfo}>
                      <ThemedText style={[styles.severityText, { color: incidentSeverityColor }]}>
                        {incident.severity.toUpperCase()}
                      </ThemedText>
                      <ThemedText style={[styles.severityDescription, { color: metaTextColor }]}>
                        {incident.status.replace('_', ' ').toUpperCase()}
                      </ThemedText>
                    </ThemedView>
                  </ThemedView>
                </ThemedView>
              </ThemedView>
              
              {/* Incident Title with Action Icons */}
              <ThemedView style={styles.titleSection}>
                <ThemedView style={styles.titleWithActions}>
                  <ThemedText style={[styles.incidentTitle, { color: textColor }]}>
                    {incident.title}
                  </ThemedText>
                  <ThemedView style={styles.titleActionButtons}>
                    <TouchableOpacity
                      style={[styles.titleActionButton, { backgroundColor: tintColor + '15' }]}
                      onPress={() => router.push({ 
                        pathname: "/modals/edit-incident", 
                        params: { incidentId: incident.id } 
                      })}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="pencil-outline" size={20} color={tintColor} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.titleActionButton, { backgroundColor: errorTextColor + '15' }]}
                      onPress={handleDeleteIncident}
                      disabled={isDeleting}
                      activeOpacity={0.7}
                    >
                      {isDeleting ? (
                        <ActivityIndicator size="small" color={errorTextColor} />
                      ) : (
                        <Ionicons name="trash-outline" size={20} color={errorTextColor} />
                      )}
                    </TouchableOpacity>
                  </ThemedView>
                </ThemedView>
              </ThemedView>

              {/* Key Metrics */}
              <ThemedView style={styles.metricsContainer}>
                <ThemedView style={styles.metricRow}>
                  <ThemedView style={[styles.metricItem, { backgroundColor: `${surfaceColor}10` }]}>
                    <Ionicons name="cube-outline" size={16} color={metaTextColor} />
                    <ThemedView style={styles.metricContent}>
                      <ThemedText style={[styles.metricLabel, { color: metaTextColor }]}>Location</ThemedText>
                      <ThemedText style={[styles.metricValue, { color: textColor }]}>
                        {incident.roomName || incident.roomId}
                      </ThemedText>
                    </ThemedView>
                  </ThemedView>
                  
                  <ThemedView style={[styles.metricItem, { backgroundColor: `${surfaceColor}10` }]}>
                    <Ionicons name="time-outline" size={16} color={metaTextColor} />
                    <ThemedView style={styles.metricContent}>
                      <ThemedText style={[styles.metricLabel, { color: metaTextColor }]}>Reported</ThemedText>
                      <ThemedText style={[styles.metricValue, { color: textColor }]}>
                        {incident.reportedAt ? formatTimeAgo(incident.reportedAt) : 'N/A'}
                      </ThemedText>
                    </ThemedView>
                  </ThemedView>
                </ThemedView>

                <ThemedView style={styles.metricRow}>
                  <ThemedView style={[styles.metricItem, { backgroundColor: `${surfaceColor}10` }]}>
                    <Ionicons name="person-outline" size={16} color={metaTextColor} />
                    <ThemedView style={styles.metricContent}>
                      <ThemedText style={[styles.metricLabel, { color: metaTextColor }]}>Reported By</ThemedText>
                      <ThemedText style={[styles.metricValue, { color: textColor }]}>
                        {incident.reportedBy}
                      </ThemedText>
                    </ThemedView>
                  </ThemedView>
                  
                  {incident.alertId && (
                    <ThemedView style={[styles.metricItem, { backgroundColor: `${surfaceColor}10` }]}>
                      <Ionicons name="notifications-outline" size={16} color={metaTextColor} />
                      <ThemedView style={styles.metricContent}>
                        <ThemedText style={[styles.metricLabel, { color: metaTextColor }]}>Related Alert</ThemedText>
                        <ThemedText style={[styles.metricValue, { color: textColor }]}>
                          {incident.alertId}
                        </ThemedText>
                      </ThemedView>
                    </ThemedView>
                  )}
                </ThemedView>
              </ThemedView>
            </ThemedView>
          </Card>

          {/* Description Card */}
          <Card>
            <ThemedText style={[styles.sectionTitle, { color: sectionTitleColor }]}>
              <Ionicons name="document-text-outline" size={20} color={sectionTitleColor} /> Description
            </ThemedText>
            
            <ThemedView style={styles.messageContainer}>
              <ThemedView style={[styles.messageIconContainer, { backgroundColor: `${incidentSeverityColor}15` }]}>
                <Ionicons name="information-outline" size={28} color={incidentSeverityColor} />
              </ThemedView>
              <ThemedView style={styles.messageContent}>
                <ThemedText style={[styles.messageText, { color: textColor }]}>
                  {incident.description}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </Card>

          {/* Actions Taken Card */}
          {incident.actionsTaken && incident.actionsTaken.length > 0 && (
            <Card>
              <ThemedText style={[styles.sectionTitle, { color: sectionTitleColor }]}>
                <Ionicons name="construct-outline" size={20} color={sectionTitleColor} /> Actions Taken
              </ThemedText>
              
              <ThemedView style={styles.actionsContainer}>
                {incident.actionsTaken.map((action, index) => (
                  <ThemedView key={index} style={styles.actionItem}>
                    <ThemedView style={[styles.actionIconContainer, { backgroundColor: `${actionIconColor}15` }]}>
                      <Ionicons name="checkmark-circle" size={20} color={actionIconColor} />
                    </ThemedView>
                    <ThemedText style={[styles.actionText, { color: textColor }]}>
                      {action}
                    </ThemedText>
                  </ThemedView>
                ))}
              </ThemedView>
            </Card>
          )}

          {/* Resolution Details Card */}
          {incident.resolutionDetails && (
            <Card>
              <ThemedText style={[styles.sectionTitle, { color: sectionTitleColor }]}>
                <Ionicons name="checkmark-done-circle-outline" size={20} color={sectionTitleColor} /> Resolution Details
              </ThemedText>
              
              <ThemedView style={styles.messageContainer}>
                <ThemedView style={[styles.messageIconContainer, { backgroundColor: `${successSeverityColor}15` }]}>
                  <Ionicons name="checkmark-done" size={28} color={successSeverityColor} />
                </ThemedView>
                <ThemedView style={styles.messageContent}>
                  <ThemedText style={[styles.messageText, { color: textColor }]}>
                    {incident.resolutionDetails}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            </Card>
          )}

          {/* Technical Details Card */}
          <Card>
            <ThemedText style={[styles.sectionTitle, { color: sectionTitleColor }]}>
              <Ionicons name="information-circle-outline" size={20} color={sectionTitleColor} /> Technical Details
            </ThemedText>
            
            <ThemedView style={styles.technicalDetailsContainer}>
              {/* Date & Time */}
              <ThemedView style={styles.technicalDetailItem}>
                <ThemedView style={styles.technicalDetailRow}>
                  <Ionicons name="calendar-outline" size={16} color={metaTextColor} />
                  <ThemedText style={[styles.technicalDetailLabel, { color: metaTextColor }]}>
                    Date & Time
                  </ThemedText>
                </ThemedView>
                <ThemedText style={[styles.technicalDetailValue, { color: textColor }]}>
                  {incident.reportedAt ? incident.reportedAt.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'N/A'}
                </ThemedText>
              </ThemedView>

              {/* Last Updated (only if different) */}
              {incident.updatedAt && incident.updatedAt.toString() !== incident.reportedAt?.toString() && (
                <ThemedView style={styles.technicalDetailItem}>
                  <ThemedView style={styles.technicalDetailRow}>
                    <Ionicons name="refresh-outline" size={16} color={metaTextColor} />
                    <ThemedText style={[styles.technicalDetailLabel, { color: metaTextColor }]}>
                      Last Updated
                    </ThemedText>
                  </ThemedView>
                  <ThemedText style={[styles.technicalDetailValue, { color: textColor }]}>
                    {incident.updatedAt.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </ThemedText>
                </ThemedView>
              )}

              {/* Status & Severity */}
              <ThemedView style={styles.technicalDetailItem}>
                <ThemedView style={styles.technicalDetailRow}>
                  <Ionicons name={getStatusIcon(incident.status)} size={16} color={metaTextColor} />
                  <ThemedText style={[styles.technicalDetailLabel, { color: metaTextColor }]}>
                    Status & Severity
                  </ThemedText>
                </ThemedView>
                <ThemedView style={styles.technicalDetailBadges}>
                  <ThemedText style={[styles.technicalDetailBadge, { 
                    color: incidentSeverityColor,
                    backgroundColor: `${incidentSeverityColor}15`
                  }]}>
                    {incident.severity.toUpperCase()}
                  </ThemedText>
                  <ThemedText style={[styles.technicalDetailBadge, { 
                    color: incidentStatusColor,
                    backgroundColor: `${incidentStatusColor}15`
                  }]}>
                    {incident.status.replace('_', ' ').toUpperCase()}
                  </ThemedText>
                </ThemedView>
              </ThemedView>

              {/* Location */}
              <ThemedView style={styles.technicalDetailItem}>
                <ThemedView style={styles.technicalDetailRow}>
                  <Ionicons name="location-outline" size={16} color={metaTextColor} />
                  <ThemedText style={[styles.technicalDetailLabel, { color: metaTextColor }]}>
                    Location
                  </ThemedText>
                </ThemedView>
                <ThemedText style={[styles.technicalDetailValue, { color: textColor }]}>
                  {incident.roomName || incident.roomId}
                </ThemedText>
              </ThemedView>

              {/* Incident ID */}
              <ThemedView style={styles.technicalDetailItem}>
                <ThemedView style={styles.technicalDetailRow}>
                  <Ionicons name="finger-print-outline" size={16} color={metaTextColor} />
                  <ThemedText style={[styles.technicalDetailLabel, { color: metaTextColor }]}>
                    Incident ID
                  </ThemedText>
                </ThemedView>
                <ThemedText style={[styles.technicalDetailCode, { 
                  color: textColor,
                  backgroundColor: `${surfaceColor}10`
                }]}>
                  {incident.id}
                </ThemedText>
              </ThemedView>
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
  
  titleSection: {
    paddingHorizontal: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
    backgroundColor: 'transparent',
  },
  titleWithActions: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  incidentTitle: {
    flex: 1,
    fontSize: Layout.fontSize.xxl,
    fontFamily: 'Montserrat-Bold',
    marginBottom: Layout.spacing.xs,
    lineHeight: Layout.fontSize.xxl * 1.2,
    paddingRight: Layout.spacing.sm,
  },
  titleActionButtons: {
    flexDirection: 'row',
    gap: Layout.spacing.xs,
    backgroundColor: 'transparent',
    marginTop: 4, // Add slight margin to align with title
  },
  titleActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
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

  // Action Buttons - Similar to room details
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    flex: 1,
    minHeight: 44,
  },
  actionButtonText: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-SemiBold',
    marginLeft: Layout.spacing.xs,
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
  },
  
  // Actions Taken Styles
  actionsContainer: {
    gap: Layout.spacing.md,
    backgroundColor: 'transparent',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Layout.spacing.md,
    backgroundColor: 'transparent',
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    flex: 1,
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Regular',
    lineHeight: Layout.fontSize.md * 1.4,
  },
  
  // Minimalistic Technical Details Styles
  technicalDetailsContainer: {
    gap: Layout.spacing.lg,
    backgroundColor: 'transparent',
  },
  technicalDetailItem: {
    backgroundColor: 'transparent',
  },
  technicalDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
    marginBottom: Layout.spacing.sm,
    backgroundColor: 'transparent',
  },
  technicalDetailLabel: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  technicalDetailValue: {
    fontSize: Layout.fontSize.lg,
    fontFamily: 'Montserrat-SemiBold',
  },
  technicalDetailCode: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Monaco, Consolas, monospace',
    padding: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.sm,
  },
  technicalDetailBadges: {
    flexDirection: 'row',
    gap: Layout.spacing.sm,
    backgroundColor: 'transparent',
  },
  technicalDetailBadge: {
    fontSize: Layout.fontSize.xs,
    fontFamily: 'Montserrat-Bold',
    letterSpacing: 0.5,
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.sm,
  },
  
  // Legacy styles for compatibility
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