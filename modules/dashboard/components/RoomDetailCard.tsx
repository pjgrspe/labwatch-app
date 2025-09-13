// labwatch-app/modules/dashboard/components/RoomDetailCard.tsx
import { Card, ThemedText, ThemedView } from '@/components';
import { Colors, Layout } from '@/constants';
import { useCurrentTheme, useThemeColor } from '@/hooks';
import { Room } from '@/types/rooms';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet } from 'react-native';
import RoomSelectorDropdown from './RoomSelectorDropdown';

interface RoomDetailCardProps {
  rooms: string[];
  selectedRoom: string;
  onSelectRoom: (room: string) => void;
  selectedRoomData?: Room;
  hasRoomData: boolean;
}

const RoomDetailCard: React.FC<RoomDetailCardProps> = ({
  rooms,
  selectedRoom,
  onSelectRoom,
  selectedRoomData,
  hasRoomData,
}) => {
  const sectionTitleColor = useThemeColor({}, 'text');
  const currentTheme = useCurrentTheme();
  const themeColors = Colors[currentTheme];
  const cardBackgroundColor = useThemeColor({}, 'cardBackground');
  const iconColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');
  const subtleTextColor = useThemeColor({}, 'icon');

  // Status indicator for room monitoring
  const getRoomMonitoringStatus = () => {
    if (!selectedRoomData) return 'unknown';
    if (selectedRoomData.isArchived) return 'archived';
    if (selectedRoomData.isMonitored) return 'active';
    return 'inactive';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'archived': return 'archive-outline';
      case 'active': return 'checkmark-circle';
      case 'inactive': return 'pause-circle';
      default: return 'help-circle';
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'archived': return themeColors.disabledText;
      case 'active': return themeColors.successText;
      case 'inactive': return themeColors.warningText;
      default: return themeColors.icon;
    }
  };

  const roomMonitoringStatus = getRoomMonitoringStatus();

  // Format creation date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };return (
    <ThemedView style={styles.container}>
      {/* Single Unified Card */}
      <Card style={[styles.unifiedCard, { backgroundColor: cardBackgroundColor }]}>
        {/* Header Section */}
        <ThemedView style={styles.headerSection}>
          <ThemedView style={styles.headerTop}>
            <ThemedView style={styles.headerLeft}>
              <Ionicons name="business-outline" size={24} color={iconColor} />
              <ThemedText style={[styles.headerTitle, { color: sectionTitleColor }]}>
                Room Overview
              </ThemedText>
            </ThemedView>            {hasRoomData && selectedRoom !== 'No Rooms Available' && (
              <ThemedView style={styles.headerRight}>
                <ThemedView style={[styles.statusBadge, { backgroundColor: getStatusColor(roomMonitoringStatus) + '15', borderColor: getStatusColor(roomMonitoringStatus) }]}>
                  <Ionicons name={getStatusIcon(roomMonitoringStatus)} size={16} color={getStatusColor(roomMonitoringStatus)} />
                  <ThemedText style={[styles.statusText, { color: getStatusColor(roomMonitoringStatus) }]}>
                    {roomMonitoringStatus.toUpperCase()}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            )}
          </ThemedView>
          
          <RoomSelectorDropdown
            rooms={rooms}
            selectedRoom={selectedRoom}
            onSelectRoom={onSelectRoom}
          />
        </ThemedView>        {/* Content Section */}
        {selectedRoom !== 'No Rooms Available' && hasRoomData && selectedRoomData ? (
          <ThemedView style={styles.contentSection}>
            <ThemedView style={styles.metricsGrid}>

              {/* Location */}
              <ThemedView style={styles.metricItem}>
                <ThemedView style={[styles.metricIcon, { backgroundColor: themeColors.successText + '15' }]}>
                  <Ionicons name="location-outline" size={20} color={themeColors.successText} />
                </ThemedView>
                <ThemedView style={styles.metricContent}>
                  <ThemedText style={[styles.metricLabel, { color: subtleTextColor }]}>
                    Location
                  </ThemedText>
                  <ThemedText style={[styles.metricValue, { color: sectionTitleColor }]}>
                    {selectedRoomData.location}
                  </ThemedText>
                </ThemedView>
              </ThemedView>

              {/* ESP32 Module */}
              {selectedRoomData.esp32ModuleId && (
                <ThemedView style={styles.metricItem}>
                  <ThemedView style={[styles.metricIcon, { backgroundColor: themeColors.warningText + '15' }]}>
                    <Ionicons name="hardware-chip-outline" size={20} color={themeColors.warningText} />
                  </ThemedView>
                  <ThemedView style={styles.metricContent}>
                    <ThemedText style={[styles.metricLabel, { color: subtleTextColor }]}>
                      ESP32 Module
                    </ThemedText>
                    <ThemedText style={[styles.metricValue, { color: sectionTitleColor }]}>
                      {selectedRoomData.esp32ModuleName || selectedRoomData.esp32ModuleId}
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
              )}

              {/* Created Date */}
              <ThemedView style={styles.metricItem}>
                <ThemedView style={[styles.metricIcon, { backgroundColor: themeColors.accent + '15' }]}>
                  <Ionicons name="calendar-outline" size={20} color={themeColors.accent} />
                </ThemedView>
                <ThemedView style={styles.metricContent}>
                  <ThemedText style={[styles.metricLabel, { color: subtleTextColor }]}>
                    Created
                  </ThemedText>
                  <ThemedText style={[styles.metricValue, { color: sectionTitleColor }]}>
                    {formatDate(selectedRoomData.createdAt)}
                  </ThemedText>
                </ThemedView>
              </ThemedView>

              {/* Monitoring Status */}
              <ThemedView style={styles.metricItem}>
                <ThemedView style={[styles.metricIcon, { backgroundColor: getStatusColor(roomMonitoringStatus) + '15' }]}>
                  <Ionicons name="pulse-outline" size={20} color={getStatusColor(roomMonitoringStatus)} />
                </ThemedView>
                <ThemedView style={styles.metricContent}>
                  <ThemedText style={[styles.metricLabel, { color: subtleTextColor }]}>
                    Monitoring
                  </ThemedText>
                  <ThemedText style={[styles.metricValue, { color: sectionTitleColor }]}>
                    {selectedRoomData.isMonitored ? 'Active' : 'Inactive'}
                  </ThemedText>
                  <ThemedView style={[styles.statusDot, { backgroundColor: getStatusColor(roomMonitoringStatus) }]} />
                </ThemedView>
              </ThemedView>
            </ThemedView>
          </ThemedView>        ) : (
          <ThemedView style={styles.emptyContentSection}>
            <Ionicons 
              name={selectedRoom === 'No Rooms Available' ? "home-outline" : "information-circle-outline"} 
              size={48} 
              color={iconColor} 
              style={styles.emptyStateIcon}
            />
            <ThemedText style={[styles.emptyStateTitle, { color: sectionTitleColor }]}>
              {selectedRoom === 'No Rooms Available' 
                ? 'No Rooms Available' 
                : 'No Room Data'
              }
            </ThemedText>
            <ThemedText style={[styles.emptyStateMessage, { color: iconColor }]}>
              {selectedRoom === 'No Rooms Available' 
                ? 'Please configure room monitoring to get started.' 
                : `Room information for ${selectedRoom} is not available.`
              }
            </ThemedText>
          </ThemedView>
        )}
      </Card>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Layout.spacing.md,
    backgroundColor: 'transparent',
  },
  
  // Unified Card
  unifiedCard: {
    paddingVertical: Layout.spacing.lg,
    paddingHorizontal: Layout.spacing.lg,
  },

  // Header Section
  headerSection: {
    backgroundColor: 'transparent',
    marginBottom: Layout.spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
    backgroundColor: 'transparent',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: Layout.fontSize.xl,
    fontFamily: 'Montserrat-Bold',
    marginLeft: Layout.spacing.md,
  },
  sensorCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.xs,
    backgroundColor: 'transparent',
  },
  sensorCountText: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-SemiBold',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.pill,
    borderWidth: 1,
  },
  statusText: {
    fontSize: Layout.fontSize.xs,
    fontFamily: 'Montserrat-Bold',
    marginLeft: Layout.spacing.xs,
  },

  // Content Section
  contentSection: {
    backgroundColor: 'transparent',
  },
  metricsGrid: {
    gap: Layout.spacing.md,
    backgroundColor: 'transparent',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    gap: Layout.spacing.md,
  },
  metricIcon: {
    width: 44,
    height: 44,
    borderRadius: Layout.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  metricLabel: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Medium',
  },
  metricValue: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-SemiBold',
    flex: 1,
    marginLeft: Layout.spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: Layout.spacing.sm,
  },

  // Empty Content Section
  emptyContentSection: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.xl,
    backgroundColor: 'transparent',
  },
  emptyStateIcon: {
    marginBottom: Layout.spacing.md,
    opacity: 0.5,
  },
  emptyStateTitle: {
    fontSize: Layout.fontSize.lg,
    fontFamily: 'Montserrat-Bold',
    marginBottom: Layout.spacing.sm,
    textAlign: 'center',
  },
  emptyStateMessage: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    lineHeight: Layout.fontSize.md * 1.5,
    maxWidth: 280,
  },
});

export default RoomDetailCard;