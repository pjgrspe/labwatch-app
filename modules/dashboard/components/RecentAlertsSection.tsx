import Card from '@/components/Card';
import SectionHeader from '@/components/SectionHeader';
import { Text as ThemedText } from '@/components/Themed';
import { ColorName } from '@/constants/Colors'; // Added Colors
import Layout from '@/constants/Layout';
import { useThemeColor } from '@/hooks/useThemeColor';
import { AlertSeverity, Alert as AlertType, AlertType as AlertTypeStrings } from '@/types/alerts'; // Added AlertTypeStrings
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

// Consistent severity theme colors with alerts/index.tsx
const severityThemeColors: { [key in AlertSeverity]: ColorName } = {
  critical: 'errorText',
  high: 'warningText',
  medium: 'infoText', // Matched to alerts/index.tsx
  low: 'successText',
  info: 'icon', // Matched to alerts/index.tsx
};

// Consistent icon mapping with alerts/index.tsx
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

const formatTimeAgo = (timestamp: Date): string => {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - timestamp.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

interface RecentAlertCardProps {
  alert: AlertType;
  onPress: () => void;
  isLastItemInSection?: boolean; // Added for consistency with alerts/index.tsx styling
}

const RecentAlertCard: React.FC<RecentAlertCardProps> = ({ alert, onPress, isLastItemInSection }) => {
  const itemSeverityColor = useThemeColor({}, severityThemeColors[alert.severity] || 'text');
  const cardBackgroundColor = useThemeColor({}, 'cardBackground');
  const titleColor = useThemeColor({}, 'text');
  const detailColor = useThemeColor({}, 'icon');
  const acknowledgedColor = useThemeColor({}, 'successText');
  const borderColor = useThemeColor({}, 'borderColor');

  const timestamp = alert.timestamp instanceof Date
    ? alert.timestamp
    : (alert.timestamp && 'seconds' in alert.timestamp)
      ? new Date((alert.timestamp as any).seconds * 1000)
      : new Date();

  const timeString = formatTimeAgo(timestamp);
  const iconName = getIconForAlertType(alert.type as AlertTypeStrings); // Cast to AlertTypeStrings

  const acknowledgedAt = alert.acknowledgedAt instanceof Date
    ? alert.acknowledgedAt
    : (alert.acknowledgedAt && 'seconds' in alert.acknowledgedAt)
      ? new Date((alert.acknowledgedAt as any).seconds * 1000)
      : null;

  const acknowledgedAtString = acknowledgedAt
    ? ` @ ${acknowledgedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : '';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Card style={[
        styles.alertCard, // Updated styles below
        {
          backgroundColor: cardBackgroundColor,
          borderColor: alert.acknowledged ? borderColor : itemSeverityColor,
          borderWidth: alert.acknowledged ? 1 : 2, // Match alerts/index.tsx
          opacity: alert.acknowledged ? 0.7 : 1,    // Match alerts/index.tsx
        },
        isLastItemInSection ? styles.lastItemInSection : {} // Match alerts/index.tsx
      ]}>
        <View style={styles.alertContent}>
          <View style={styles.alertIconContainer}>
            <Ionicons
              name={iconName}
              size={32} // Matched from alerts/index.tsx
              color={alert.acknowledged ? acknowledgedColor : itemSeverityColor}
            />
            {!alert.acknowledged && (
              <View style={[styles.severityBadge, { backgroundColor: itemSeverityColor }]}>
                <ThemedText style={styles.severityBadgeText}>
                  {alert.severity === 'critical' ? '!' : alert.severity.charAt(0).toUpperCase()}
                </ThemedText>
              </View>
            )}
          </View>

          <View style={styles.alertTextContainer}>
            <View style={styles.alertHeader}>
              <ThemedText style={[styles.alertMessage, { color: titleColor }]} numberOfLines={2}>
                {/* Use message if available, otherwise format type */}
                {alert.message?.split(':')[0] || alert.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </ThemedText>
              <View style={styles.statusContainer}>
                {alert.acknowledged ? (
                  <View style={[styles.statusBadge, { backgroundColor: acknowledgedColor + '20' }]}>
                    <Ionicons name="checkmark-circle" size={14} color={acknowledgedColor} />
                    <ThemedText style={[styles.statusText, { color: acknowledgedColor }]}>
                      ACK
                    </ThemedText>
                  </View>
                ) : (
                  <View style={[styles.statusBadge, { backgroundColor: itemSeverityColor + '20' }]}>
                    <ThemedText style={[styles.statusText, { color: itemSeverityColor }]}>
                      {alert.severity.toUpperCase()}
                    </ThemedText>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.alertMeta}>
              <View style={styles.metaRow}>
                <Ionicons name="location-outline" size={14} color={detailColor} />
                <ThemedText style={[styles.metaText, { color: detailColor }]} numberOfLines={1}>
                  {alert.roomName}
                  {alert.sensorId && ` • ${alert.sensorId.substring(alert.sensorId.lastIndexOf('-') + 1)}`}
                </ThemedText>
              </View>

              <View style={styles.metaRow}>
                <Ionicons name="time-outline" size={14} color={detailColor} />
                <ThemedText style={[styles.metaText, { color: detailColor }]}>
                  {timeString}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        {alert.acknowledged && alert.acknowledgedByName && (
          <View style={styles.acknowledgedInfo}>
            <ThemedText style={[styles.acknowledgedByText, { color: detailColor }]}>
              Acknowledged by {alert.acknowledgedByName}{acknowledgedAtString}
            </ThemedText>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
};

interface RecentAlertsSectionProps {
  title: string;
  alerts: AlertType[];
  onPressViewAll: () => void;
}

const RecentAlertsSection: React.FC<RecentAlertsSectionProps> = ({ title, alerts, onPressViewAll }) => {
  const router = useRouter();
  const sectionTitleColor = useThemeColor({}, 'text');
  const cardBackgroundColor = useThemeColor({}, 'cardBackground'); // For empty state
  const emptyStateIconColor = useThemeColor({}, 'successText'); // For empty state icon
  const emptyStateTextColor = useThemeColor({}, 'text'); // For empty state text

  if (!alerts || alerts.length === 0) {
    return (
      <View style={styles.container}>
        <SectionHeader
          title={title}
          onPressViewAll={onPressViewAll}
        />
        {/* Empty state styling matched from alerts/index.tsx */}
        <View style={[styles.centered, { marginHorizontal: Layout.spacing.md }]}>
            <Card style={[styles.emptyStateCard, { backgroundColor: cardBackgroundColor }]}>
                <Ionicons
                    name="shield-checkmark-outline"
                    size={48} // Adjusted from 70 to better fit the card
                    color={emptyStateIconColor}
                    style={styles.emptyStateIcon}
                />
                <ThemedText style={[styles.emptyStateTitle, { color: emptyStateTextColor }]}>
                    All Clear
                </ThemedText>
                <ThemedText style={[styles.emptyStateMessage, { color: emptyStateTextColor, opacity: 0.7 }]}>
                    No recent alerts. Your lab is running smoothly.
                </ThemedText>
            </Card>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SectionHeader
        title={title}
        onPressViewAll={onPressViewAll}
      />
      {/* Removed listContainer to use direct margin on alertItemTouchable */}
      {alerts.slice(0, 3).map((alert, index) => ( // Show max 3 alerts
        <RecentAlertCard
          key={alert.id}
          alert={alert}
          onPress={() => router.push(`/(tabs)/alerts/${alert.id}` as any)}
          isLastItemInSection={index === Math.min(2, alerts.length -1)} // Apply last item style correctly
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Layout.spacing.lg, // Increased bottom margin for section
  },
  // Centered style for empty state text, from alerts/index.tsx
  centered: {
    // flex: 1, // Removed to allow it to sit within the section
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Layout.spacing.lg, // Added padding
  },
  emptyStateCard: { // Card for empty state, similar to alerts/index.tsx but simpler for dashboard
    padding: Layout.spacing.lg,
    alignItems: 'center',
    width: '100%', // Take full width of its container
    borderRadius: Layout.borderRadius.lg,
  },
  emptyStateIcon: {
    marginBottom: Layout.spacing.md,
  },
  emptyStateTitle: {
    fontSize: Layout.fontSize.lg, // Matched from alerts/index.tsx
    fontFamily: 'Montserrat-Bold',
    marginBottom: Layout.spacing.xs,
  },
  emptyStateMessage: {
    fontSize: Layout.fontSize.sm, // Matched from alerts/index.tsx
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
  },

  alertCard: {
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    position: 'relative',
    // Shadow from alerts/index.tsx (Card component might handle this already or can be added)
    // elevation: 1,
    // shadowColor: '#000000',
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.05,
    // shadowRadius: 2,
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Align items to the start for better text flow
    backgroundColor: 'transparent',
  },
  alertIconContainer: {
    position: 'relative',
    marginRight: Layout.spacing.md,
    alignItems: 'center', // Center icon if needed
    // No specific background needed here as per alerts/index.tsx style
  },
  severityBadge: { // From alerts/index.tsx
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  severityBadgeText: { // From alerts/index.tsx
    fontSize: 10,
    fontFamily: 'Montserrat-Bold',
    color: '#FFFFFF',
  },
  alertTextContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  alertHeader: { // From alerts/index.tsx
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.sm, // Matched
  },
  alertMessage: { // Renamed from alertTitle, matched styling from alerts/index.tsx
    flex: 1,
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-SemiBold', // Matched
    marginRight: Layout.spacing.sm, // Matched
    lineHeight: Layout.fontSize.md * 1.3, // Matched
  },
  statusContainer: { // From alerts/index.tsx
    alignItems: 'flex-end',
  },
  statusBadge: { // From alerts/index.tsx
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs / 2,
    borderRadius: Layout.borderRadius.sm,
  },
  statusText: { // From alerts/index.tsx
    fontSize: Layout.fontSize.xs,
    fontFamily: 'Montserrat-Bold',
    marginLeft: Layout.spacing.xs / 2,
  },
  alertMeta: { // From alerts/index.tsx
    gap: Layout.spacing.xs / 2,
  },
  metaRow: { // From alerts/index.tsx
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: { // From alerts/index.tsx, renamed from alertSubtitle & alertTime
    fontSize: Layout.fontSize.sm, // Matched
    fontFamily: 'Montserrat-Regular', // Matched
    marginLeft: Layout.spacing.xs,
    flex: 1, // Allow text to take available space
  },
  acknowledgedInfo: { // From alerts/index.tsx
    marginTop: Layout.spacing.sm,
    paddingTop: Layout.spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    // borderTopColor: Colors.light.borderColor, // Handled by useThemeColor or direct value
    borderTopColor: 'rgba(0,0,0,0.1)', // Fallback, useThemeColor preferred
  },
  acknowledgedByText: { // From alerts/index.tsx
    fontSize: Layout.fontSize.xs,
    fontStyle: 'italic',
    fontFamily: 'Montserrat-Regular',
    textAlign: 'right',
  },
  lastItemInSection: { // From alerts/index.tsx
    // No specific style needed if marginBottom is handled by alertItemTouchable
  }
});

export default RecentAlertsSection;