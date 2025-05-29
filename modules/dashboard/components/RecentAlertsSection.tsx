// Modify labwatch-app/modules/dashboard/components/RecentAlertsSection.tsx
import Card from '@/components/Card';
import SectionHeader from '@/components/SectionHeader';
import { Text as ThemedText } from '@/components/Themed';
import { ColorName } from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { useThemeColor } from '@/hooks/useThemeColor';
import { AlertSeverity, Alert as AlertType } from '@/types/alerts';
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


interface RecentAlertCardProps {
  alert: AlertType;
  onPress: () => void;
}

const RecentAlertCard: React.FC<RecentAlertCardProps> = ({ alert, onPress }) => {
  const cardBackgroundColor = useThemeColor({}, 'cardBackground');
  const titleColor = useThemeColor({}, 'text');
  const detailColor = useThemeColor({}, 'icon');
  const severityColor = useThemeColor({}, severityThemeColors[alert.severity] || 'text');

  const timeString = alert.timestamp instanceof Date
    ? alert.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : (alert.timestamp && 'seconds' in alert.timestamp)
      ? new Date((alert.timestamp as any).seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : 'N/A';

  return (
    <TouchableOpacity onPress={onPress} style={[styles.recentAlertCard, { backgroundColor: cardBackgroundColor, borderLeftColor: severityColor }]}>
      <Ionicons name={getIconForAlertType(alert.type)} size={28} color={severityColor} style={styles.recentAlertIcon} />
      <View style={styles.recentAlertTextContainer}>
        <ThemedText style={[styles.recentAlertTitle, { color: titleColor }]} numberOfLines={1}>{alert.type.replace(/_/g, ' ')}</ThemedText>
        {/* MODIFIED to display roomName */}
        <ThemedText style={[styles.recentAlertSubtitle, { color: detailColor }]} numberOfLines={1}>{alert.roomName} - {alert.message.split(':')[0]}</ThemedText>
        <ThemedText style={[styles.recentAlertSubtitle, { color: detailColor, fontSize: Layout.fontSize.xs -1 }]}>
          {/* MODIFIED to display acknowledgedByName */}
          {timeString} - {alert.acknowledged ? `Ack by ${alert.acknowledgedByName || alert.acknowledgedBy || 'N/A'}` : 'Unacknowledged'}
        </ThemedText>
      </View>
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

  if (!alerts || alerts.length === 0) {
    return (
      <View style={styles.container}>
        <SectionHeader title={title} onPressViewAll={onPressViewAll} />
        <View style={styles.listItemContainer}>
            <Card style={styles.cardWithPadding}>
                 <ThemedText style={[styles.noDataText, { color: sectionTitleColor }]}>No recent alerts.</ThemedText>
            </Card>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SectionHeader title={title} onPressViewAll={onPressViewAll} />
      <View style={styles.listItemContainer}>
        {alerts.map(alert => (
          <RecentAlertCard
            key={alert.id}
            alert={alert}
            onPress={() => router.push(`/(tabs)/alerts/${alert.id}` as any)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // No specific styles needed here if children handle padding
  },
  listItemContainer: {
    paddingHorizontal: Layout.spacing.md,
  },
  recentAlertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    marginBottom: Layout.spacing.md,
    borderLeftWidth: 5,
    ...Layout.cardShadow,
  },
  recentAlertIcon: {
    marginRight: Layout.spacing.md,
  },
  recentAlertTextContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  recentAlertTitle: {
    fontSize: Layout.fontSize.md,
    fontWeight: Layout.fontWeight.semibold,
    textTransform: 'capitalize',
  },
  recentAlertSubtitle: {
    fontSize: Layout.fontSize.sm,
    marginTop: Layout.spacing.xs,
  },
  cardWithPadding: {
    marginBottom: Layout.spacing.lg,
    padding: Layout.spacing.lg,
  },
  noDataText: {
    textAlign: 'center',
    paddingVertical: Layout.spacing.lg,
    fontSize: Layout.fontSize.md,
  },
});

export default RecentAlertsSection;