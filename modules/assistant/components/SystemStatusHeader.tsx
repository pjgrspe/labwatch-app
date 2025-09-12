// labwatch-app/modules/assistant/components/SystemStatusHeader.tsx
import { Card, ThemedText, ThemedView } from '@/components';
import { Layout } from '@/constants';
import { useThemeColor } from '@/hooks';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface SystemStatusHeaderProps {
  systemSummary?: string;
  criticalAlerts: number;
  activeRooms: number;
  onRefresh: () => void;
  isLoading: boolean;
}

export const SystemStatusHeader: React.FC<SystemStatusHeaderProps> = ({
  systemSummary,
  criticalAlerts,
  activeRooms,
  onRefresh,
  isLoading
}) => {
  const textColor = useThemeColor({}, 'text');
  const subtleTextColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');
  const criticalColor = useThemeColor({}, 'errorText');
  const successColor = useThemeColor({}, 'successText');

  const getStatusColor = () => {
    if (criticalAlerts > 0) return criticalColor;
    return successColor;
  };

  const getStatusIcon = () => {
    if (criticalAlerts > 0) return 'warning';
    return 'checkmark-circle';
  };

  const getStatusText = () => {
    if (criticalAlerts > 0) return `${criticalAlerts} Critical Alert${criticalAlerts > 1 ? 's' : ''}`;
    return 'All Systems Normal';
  };

  return (
    <Card style={styles.container} paddingSize="md">
      <ThemedView style={styles.header}>
        <ThemedView style={styles.statusRow}>
          <Ionicons 
            name={getStatusIcon() as any} 
            size={20} 
            color={getStatusColor()} 
          />
          <ThemedText style={[
            styles.statusText, 
            { color: getStatusColor(), fontFamily: 'Montserrat-Medium' }
          ]}>
            {getStatusText()}
          </ThemedText>
        </ThemedView>
        
        <TouchableOpacity 
          onPress={onRefresh}
          disabled={isLoading}
          style={[styles.refreshButton, { borderColor: tintColor }]}
        >
          <Ionicons 
            name={isLoading ? 'hourglass' : 'refresh'} 
            size={16} 
            color={tintColor} 
          />
        </TouchableOpacity>
      </ThemedView>
      
      <ThemedView style={styles.statsRow}>
        <ThemedView style={styles.statItem}>
          <ThemedText style={[styles.statNumber, { color: textColor }]}>
            {activeRooms}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: subtleTextColor }]}>
            Active Rooms
          </ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.statDivider} />
        
        <ThemedView style={styles.statItem}>
          <ThemedText style={[styles.statNumber, { color: criticalAlerts > 0 ? criticalColor : successColor }]}>
            {criticalAlerts}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: subtleTextColor }]}>
            Critical Alerts
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Layout.spacing.md,
    marginTop: Layout.spacing.sm,
    marginBottom: Layout.spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
    backgroundColor: 'transparent',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  statusText: {
    fontSize: Layout.fontSize.md,
    fontWeight: Layout.fontWeight.medium,
    marginLeft: Layout.spacing.xs,
  },
  refreshButton: {
    padding: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.sm,
    borderWidth: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
    backgroundColor: 'transparent',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'transparent',
  },
  statNumber: {
    fontSize: Layout.fontSize.xl,
    fontFamily: 'Montserrat-Bold',
    fontWeight: Layout.fontWeight.bold,
  },
  statLabel: {
    fontSize: Layout.fontSize.xs,
    fontFamily: 'Montserrat-Regular',
    marginTop: Layout.spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#E0E0E0',
    opacity: 0.3,
  },
  summaryText: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
    lineHeight: Layout.fontSize.sm * 1.4,
    fontStyle: 'italic',
  },
});
