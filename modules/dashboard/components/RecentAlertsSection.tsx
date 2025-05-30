// labwatch-app/modules/dashboard/components/RecentAlertsSection.tsx
import { Card, SectionHeader, ThemedText, ThemedView } from '@/components';
import { ColorName, Layout } from '@/constants';
import { useThemeColor } from '@/hooks';
import { AlertSeverity, Alert as AlertType, AlertType as AlertTypeStrings } from '@/types/alerts';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

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
}

const RecentAlertCardDisplay: React.FC<RecentAlertCardProps> = ({ alert, onPress }) => {
  const itemSeverityColor = useThemeColor({}, severityThemeColors[alert.severity] || 'text');
  const cardBackgroundColor = useThemeColor({}, 'cardBackground');
  const titleColor = useThemeColor({}, 'text');
  const detailColor = useThemeColor({}, 'icon');
  const acknowledgedColor = useThemeColor({}, 'successText');
  const borderColor = useThemeColor({}, 'borderColor'); // For acknowledged alerts

  const timestamp = alert.timestamp instanceof Date
    ? alert.timestamp
    : (alert.timestamp && 'seconds' in alert.timestamp)
      ? new Date((alert.timestamp as any).seconds * 1000)
      : new Date();

  const timeString = formatTimeAgo(timestamp);
  const iconName = getIconForAlertType(alert.type as AlertTypeStrings);

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
      style={styles.alertCardTouchable} // Added for consistent margin
    >
      <Card 
        style={[
          styles.alertCard,
          {
            // Card component handles background color via its own hook
            borderColor: alert.acknowledged ? borderColor : itemSeverityColor, // Use theme borderColor for acknowledged
            borderLeftColor: alert.acknowledged ? acknowledgedColor : itemSeverityColor, // Keep colored left border distinct
            borderLeftWidth: 4, // Consistent left border
            borderWidth: alert.acknowledged ? StyleSheet.hairlineWidth : 1, // Thicker border for active, thinner for acknowledged
            opacity: alert.acknowledged ? 0.8 : 1,    
          }
        ]}
        paddingSize="md" // Use Card's padding prop
      >
        <ThemedView style={styles.alertContent}>
          <ThemedView style={styles.alertIconContainer}>
            <Ionicons
              name={iconName}
              size={28} // Standardized icon size
              color={alert.acknowledged ? acknowledgedColor : itemSeverityColor}
            />
            {!alert.acknowledged && (
              <ThemedView style={[styles.severityBadge, { backgroundColor: itemSeverityColor }]}>
                <Ionicons 
                    name={alert.severity === 'critical' ? "warning" : "information-circle"} 
                    size={10} 
                    color="#FFFFFF" 
                />
              </ThemedView>
            )}
          </ThemedView>

          <ThemedView style={styles.alertTextContainer}>
            <ThemedView style={styles.alertHeader}>
              <ThemedText style={[styles.alertMessage, { color: titleColor }]} numberOfLines={1}>
                {alert.message?.split(':')[0] || alert.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </ThemedText>
              <ThemedView style={styles.statusContainer}>
                {alert.acknowledged ? (
                  <View style={[styles.statusBadge, { backgroundColor: acknowledgedColor + '20' }]}>
                    <Ionicons name="checkmark-done" size={12} color={acknowledgedColor} />
                    <ThemedText style={[styles.statusText, { color: acknowledgedColor }]}>
                      ACK
                    </ThemedText>
                  </View>
                ) : (
                  <View style={[styles.statusBadge, { backgroundColor: itemSeverityColor + '20' }]}>
                    <ThemedText style={[styles.statusText, { color: itemSeverityColor, fontFamily: 'Montserrat-Bold'}]}>
                      {alert.severity.toUpperCase()}
                    </ThemedText>
                  </View>
                )}
              </ThemedView>
            </ThemedView>

            <ThemedView style={styles.alertMeta}>
              <ThemedView style={styles.metaRow}>
                <Ionicons name="cube-outline" size={14} color={detailColor} />
                <ThemedText style={[styles.metaText, { color: detailColor }]} numberOfLines={1}>
                  {alert.roomName}
                  {alert.sensorId && ` • ${alert.sensorId.substring(alert.sensorId.lastIndexOf('-') + 1)}`}
                </ThemedText>
              </ThemedView>

              <ThemedView style={styles.metaRow}>
                <Ionicons name="time-outline" size={14} color={detailColor} />
                <ThemedText style={[styles.metaText, { color: detailColor }]}>
                  {timeString}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        {alert.acknowledged && alert.acknowledgedByName && (
          <ThemedView style={[styles.acknowledgedInfo, {borderTopColor: borderColor}]}>
            <ThemedText style={[styles.acknowledgedByText, { color: detailColor }]}>
              Acknowledged by {alert.acknowledgedByName}{acknowledgedAtString}
            </ThemedText>
          </ThemedView>
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
  const iconColor = useThemeColor({}, 'icon');
  const sectionTitleColor = useThemeColor({}, 'text');
  const cardBackgroundColor = useThemeColor({}, 'cardBackground');

  if (!alerts || alerts.length === 0) {
    return (
      <View style={styles.container}>
        <SectionHeader
          title={title}
          onPressViewAll={onPressViewAll}
        />
        <Card style={[styles.emptyStateCard, { backgroundColor: cardBackgroundColor }]} paddingSize="xl">
            <Ionicons
                name="shield-checkmark-outline"
                size={48}
                color={iconColor} // Use themed icon color
                style={styles.emptyStateIcon}
            />
            <ThemedText style={[styles.emptyStateTitle, { color: sectionTitleColor }]}>
                All Clear
            </ThemedText>
            <ThemedText style={[styles.emptyStateMessage, { color: iconColor }]}>
                No recent alerts. Your lab is running smoothly.
            </ThemedText>
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SectionHeader
        title={title}
        onPressViewAll={onPressViewAll}
      />
      {alerts.slice(0, 3).map((alert) => (
        <RecentAlertCardDisplay // Renamed component
          key={alert.id}
          alert={alert}
          onPress={() => router.push(`/(tabs)/alerts/${alert.id}` as any)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Layout.spacing.md, // Horizontal padding for the section
  },
  alertCardTouchable: {
    marginBottom: Layout.spacing.md, // Space between alert cards
  },
  alertCard: {
    
    // paddingVertical and paddingHorizontal handled by Card's paddingSize prop
    // borderRadius is handled by Card component
    // shadow is handled by Card component
    // borderLeftWidth, borderLeftColor, borderWidth, borderColor, opacity are set dynamically
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'flex-start', 
    backgroundColor: 'transparent',
  },
  alertIconContainer: {
    position: 'relative',
    marginRight: Layout.spacing.md,
    paddingTop: Layout.spacing.xs /2, // Align icon better with text
  },
  severityBadge: { 
    position: 'absolute',
    top: 0, // Adjust position relative to icon
    right: -Layout.spacing.xs, // Adjust position relative to icon
    width: 18, // Standardized badge size
    height: 18, // Standardized badge size
    borderRadius: 9, // Fully rounded
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertTextContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  alertHeader: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start', // Align items to start
    marginBottom: Layout.spacing.xs, // Reduced margin
  },
  alertMessage: { 
    flex: 1, // Allow message to take space
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-SemiBold', 
    marginRight: Layout.spacing.sm, 
    lineHeight: Layout.fontSize.md * 1.3, 
  },
  statusContainer: { 
    // alignItems: 'flex-end', // Not needed if badge is simple
  },
  statusBadge: { 
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.xs, // Reduced padding
    paddingVertical: Layout.spacing.xs / 2,
    borderRadius: Layout.borderRadius.sm,
    marginTop: Layout.spacing.xs / 2, // Align with message if it wraps
  },
  statusText: { 
    fontSize: Layout.fontSize.xs, // Smaller status text
    fontFamily: 'Montserrat-Medium', // Adjusted font weight
    marginLeft: Layout.spacing.xs / 2,
    textTransform: 'uppercase',
  },
  alertMeta: { 
    gap: Layout.spacing.xs, // Consistent gap
  },
  metaRow: { 
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: { 
    fontSize: Layout.fontSize.sm, 
    fontFamily: 'Montserrat-Regular', 
    marginLeft: Layout.spacing.xs,
    flexShrink: 1, // Allow text to shrink if needed
  },
  acknowledgedInfo: { 
    marginTop: Layout.spacing.sm,
    paddingTop: Layout.spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    // borderTopColor is set dynamically
  },
  acknowledgedByText: { 
    fontSize: Layout.fontSize.xs,
    fontStyle: 'italic',
    fontFamily: 'Montserrat-Regular',
    textAlign: 'right',
  },
  emptyStateCard: {
    // paddingSize: "xl", // This is a prop for the Card component, not a style property
    alignItems: 'center',
    marginTop: Layout.spacing.md, // Space from SectionHeader
  },
  emptyStateIcon: {
    marginBottom: Layout.spacing.md,
    opacity: 0.6,
  },
  emptyStateTitle: {
    fontSize: Layout.fontSize.lg,
    fontFamily: 'Montserrat-Bold',
    marginBottom: Layout.spacing.xs,
  },
  emptyStateMessage: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default RecentAlertsSection;