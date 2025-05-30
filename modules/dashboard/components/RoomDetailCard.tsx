// labwatch-app/modules/dashboard/components/RoomDetailCard.tsx
import { Card, ThemedText, ThemedView } from '@/components';
import { Colors, Layout } from '@/constants';
import { useCurrentTheme, useThemeColor } from '@/hooks';
import { getStatusColorForDial } from '@/modules/dashboard/utils/colorHelpers';
import { AirQualityData, TempHumidityData, ThermalImagerData, VibrationData } from '@/types/sensor';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet } from 'react-native';
import RoomSelectorDropdown from './RoomSelectorDropdown';

interface RoomDetailCardProps {
  rooms: string[];
  selectedRoom: string;
  onSelectRoom: (room: string) => void;
  tempHumidity?: TempHumidityData;
  airQuality?: AirQualityData;
  thermalData?: ThermalImagerData;
  vibrationData?: VibrationData;
  hasAnyData: boolean;
}

const RoomDetailCard: React.FC<RoomDetailCardProps> = ({
  rooms,
  selectedRoom,
  onSelectRoom,
  tempHumidity,
  airQuality,
  thermalData,
  vibrationData,
  hasAnyData,
}) => {
  const sectionTitleColor = useThemeColor({}, 'text');
  const currentTheme = useCurrentTheme();
  const themeColors = Colors[currentTheme];
  const cardBackgroundColor = useThemeColor({}, 'cardBackground');
  const iconColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');
  const subtleTextColor = useThemeColor({}, 'icon');

  // Status indicator for overall room health
  const getRoomHealthStatus = () => {
    const statuses = [
      tempHumidity?.status,
      airQuality?.aqiLevel || airQuality?.status,
      vibrationData?.status
    ].filter(Boolean);
    
    if (statuses.includes('critical')) return 'critical';
    if (statuses.includes('warning') || statuses.includes('moderate')) return 'warning';
    return 'normal';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical': return 'alert-circle';
      case 'warning': return 'warning';
      default: return 'checkmark-circle';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return themeColors.errorText;
      case 'warning': return themeColors.warningText;
      default: return themeColors.successText;
    }
  };

  const roomHealthStatus = getRoomHealthStatus();

  // Get active sensor count
  const getActiveSensorCount = () => {
    return [tempHumidity, airQuality, thermalData, vibrationData].filter(Boolean).length;
  };  return (
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
            </ThemedView>            {hasAnyData && selectedRoom !== 'No Rooms Available' && (
              <ThemedView style={styles.headerRight}>
                <ThemedView style={[styles.statusBadge, { backgroundColor: getStatusColor(roomHealthStatus) + '15', borderColor: getStatusColor(roomHealthStatus) }]}>
                  <Ionicons name={getStatusIcon(roomHealthStatus)} size={16} color={getStatusColor(roomHealthStatus)} />
                  <ThemedText style={[styles.statusText, { color: getStatusColor(roomHealthStatus) }]}>
                    {roomHealthStatus.toUpperCase()}
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
        </ThemedView>

        {/* Content Section */}
        {selectedRoom !== 'No Rooms Available' && hasAnyData ? (
          <ThemedView style={styles.contentSection}>
            <ThemedView style={styles.metricsGrid}>
              {/* Temperature & Humidity */}
              {tempHumidity && (
                <ThemedView style={styles.metricItem}>
                  <ThemedView style={[styles.metricIcon, { backgroundColor: tintColor + '15' }]}>
                    <Ionicons name="thermometer-outline" size={20} color={tintColor} />
                  </ThemedView>
                  <ThemedView style={styles.metricContent}>
                    <ThemedText style={[styles.metricLabel, { color: subtleTextColor }]}>
                      Environment
                    </ThemedText>
                    <ThemedText style={[styles.metricValue, { color: sectionTitleColor }]}>
                      {tempHumidity.temperature.toFixed(1)}°C • {tempHumidity.humidity.toFixed(0)}%
                    </ThemedText>
                    <ThemedView style={[styles.statusDot, { backgroundColor: getStatusColorForDial(tempHumidity.status, currentTheme) }]} />
                  </ThemedView>
                </ThemedView>
              )}

              {/* Air Quality */}
              {airQuality && (
                <ThemedView style={styles.metricItem}>
                  <ThemedView style={[styles.metricIcon, { backgroundColor: themeColors.successText + '15' }]}>
                    <Ionicons name="leaf-outline" size={20} color={themeColors.successText} />
                  </ThemedView>
                  <ThemedView style={styles.metricContent}>
                    <ThemedText style={[styles.metricLabel, { color: subtleTextColor }]}>
                      Air Quality
                    </ThemedText>
                    <ThemedText style={[styles.metricValue, { color: sectionTitleColor }]}>
                      PM2.5: {airQuality.pm25.toFixed(1)} μg/m³
                    </ThemedText>
                    <ThemedView style={[styles.statusDot, { backgroundColor: getStatusColorForDial(airQuality.aqiLevel || airQuality.status, currentTheme) }]} />
                  </ThemedView>
                </ThemedView>
              )}

              {/* Thermal */}
              {thermalData && (
                <ThemedView style={styles.metricItem}>
                  <ThemedView style={[styles.metricIcon, { backgroundColor: themeColors.warningText + '15' }]}>
                    <Ionicons name="camera-outline" size={20} color={themeColors.warningText} />
                  </ThemedView>
                  <ThemedView style={styles.metricContent}>
                    <ThemedText style={[styles.metricLabel, { color: subtleTextColor }]}>
                      Thermal
                    </ThemedText>
                    <ThemedText style={[styles.metricValue, { color: sectionTitleColor }]}>
                      Avg: {thermalData.avgTemp.toFixed(1)}°C
                    </ThemedText>
                    <ThemedView style={[styles.statusDot, { backgroundColor: getStatusColorForDial('normal', currentTheme) }]} />
                  </ThemedView>
                </ThemedView>
              )}

              {/* Vibration */}
              {vibrationData && (
                <ThemedView style={styles.metricItem}>
                  <ThemedView style={[styles.metricIcon, { backgroundColor: themeColors.accent + '15' }]}>
                    <Ionicons name="pulse-outline" size={20} color={themeColors.accent} />
                  </ThemedView>
                  <ThemedView style={styles.metricContent}>
                    <ThemedText style={[styles.metricLabel, { color: subtleTextColor }]}>
                      Vibration
                    </ThemedText>
                    <ThemedText style={[styles.metricValue, { color: sectionTitleColor }]}>
                      {vibrationData.rmsAcceleration.toFixed(2)} g
                    </ThemedText>
                    <ThemedView style={[styles.statusDot, { backgroundColor: getStatusColorForDial(vibrationData.status || 'normal', currentTheme) }]} />
                  </ThemedView>
                </ThemedView>
              )}
            </ThemedView>
          </ThemedView>
        ) : (
          <ThemedView style={styles.emptyContentSection}>
            <Ionicons 
              name={selectedRoom === 'No Rooms Available' ? "home-outline" : "analytics-outline"} 
              size={48} 
              color={iconColor} 
              style={styles.emptyStateIcon}
            />
            <ThemedText style={[styles.emptyStateTitle, { color: sectionTitleColor }]}>
              {selectedRoom === 'No Rooms Available' 
                ? 'No Rooms Available' 
                : 'No Sensor Data'
              }
            </ThemedText>
            <ThemedText style={[styles.emptyStateMessage, { color: iconColor }]}>
              {selectedRoom === 'No Rooms Available' 
                ? 'Please configure room monitoring to get started.' 
                : `No sensor data available for ${selectedRoom}. Check your sensor connections.`
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