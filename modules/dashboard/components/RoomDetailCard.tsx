// labwatch-app/modules/dashboard/components/RoomDetailCard.tsx
import Card from '@/components/Card';
import RoomSelectorDropdown from '@/components/dashboard/RoomSelectorDropdown';
import { Text as ThemedText, View as ThemedView } from '@/components/Themed';
import DialGauge from '@/components/ui/DialGauge';
import HeatmapGrid from '@/components/ui/HeatmapGrid';
import { Colors } from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { useCurrentTheme, useThemeColor } from '@/hooks/useThemeColor';
import { getStatusColorForDial } from '@/modules/dashboard/utils/colorHelpers';
import { AirQualityData, TempHumidityData, ThermalImagerData, VibrationData } from '@/types/sensor';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet } from 'react-native';

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
  const borderColor = useThemeColor({}, 'borderColor');
  const cardBackgroundColor = useThemeColor({}, 'cardBackground');
  const surfaceSecondaryColor = useThemeColor({}, 'surfaceSecondary');
  const iconColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');
  
  const cardContentWidth = Layout.window.width - (Layout.spacing.md * 2) - (Layout.spacing.lg * 2);
  const dialGaugeSize = Math.max(100, cardContentWidth / 2.5 - Layout.spacing.md);

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

  return (
    <ThemedView style={styles.container}>
      {/* Room Selection Header */}
      <Card style={[styles.headerCard, { backgroundColor: cardBackgroundColor }]}>
        <ThemedView style={styles.headerContent}>
          <ThemedView style={styles.headerTop}>
            <ThemedView style={styles.headerLeft}>
              <Ionicons name="business-outline" size={24} color={iconColor} />
              <ThemedText style={[styles.headerTitle, { color: sectionTitleColor }]}>
                Room Monitoring
              </ThemedText>
            </ThemedView>
            {hasAnyData && selectedRoom !== 'No Rooms Available' && (
              <ThemedView style={[styles.statusBadge, { backgroundColor: getStatusColor(roomHealthStatus) + '15', borderColor: getStatusColor(roomHealthStatus) }]}>
                <Ionicons name={getStatusIcon(roomHealthStatus)} size={16} color={getStatusColor(roomHealthStatus)} />
                <ThemedText style={[styles.statusText, { color: getStatusColor(roomHealthStatus) }]}>
                  {roomHealthStatus.toUpperCase()}
                </ThemedText>
              </ThemedView>
            )}
          </ThemedView>
          
          <RoomSelectorDropdown
            rooms={rooms}
            selectedRoom={selectedRoom}
            onSelectRoom={onSelectRoom}
          />
        </ThemedView>
      </Card>

      {/* Content Cards */}
      {selectedRoom !== 'No Rooms Available' && hasAnyData ? (
        <ThemedView style={styles.contentContainer}>
          
          {/* Environmental Monitoring */}
          {(tempHumidity || airQuality) && (
            <Card style={[styles.sectionCard, { backgroundColor: cardBackgroundColor }]}>
              <ThemedView style={styles.sectionHeader}>
                <ThemedView style={styles.sectionHeaderLeft}>
                  <ThemedView style={[styles.sectionIconContainer, { backgroundColor: tintColor + '15' }]}>
                    <Ionicons name="leaf-outline" size={20} color={tintColor} />
                  </ThemedView>
                  <ThemedText style={[styles.sectionTitle, { color: sectionTitleColor }]}>
                    Environmental
                  </ThemedText>
                </ThemedView>
                <ThemedView style={styles.sensorCount}>
                  <ThemedText style={[styles.sensorCountText, { color: iconColor }]}>
                    {[tempHumidity, airQuality].filter(Boolean).length * 2} sensors
                  </ThemedText>
                </ThemedView>
              </ThemedView>

              <ThemedView style={styles.gaugesContainer}>
                {tempHumidity && (
                  <ThemedView style={styles.gaugeRow}>
                    <ThemedView style={styles.gaugeItem}>
                      <DialGauge 
                        value={tempHumidity.temperature} 
                        label="Temperature" 
                        sensorType="tempHumidity"
                        dataType="temperature"
                        useAlertBasedRange={true}
                        size={dialGaugeSize} 
                        statusColor={getStatusColorForDial(tempHumidity.status, currentTheme)} 
                        coldColor={themeColors.accentLight} 
                        hotColor={themeColors.errorText} 
                      />
                    </ThemedView>
                    <ThemedView style={styles.gaugeItem}>
                      <DialGauge 
                        value={tempHumidity.humidity} 
                        label="Humidity" 
                        sensorType="tempHumidity"
                        dataType="humidity"
                        useAlertBasedRange={true}
                        size={dialGaugeSize} 
                        statusColor={getStatusColorForDial(tempHumidity.status, currentTheme)} 
                        coldColor={themeColors.accent} 
                        hotColor={themeColors.infoText} 
                      />
                    </ThemedView>
                  </ThemedView>
                )}
                
                {airQuality && (
                  <ThemedView style={styles.gaugeRow}>
                    <ThemedView style={styles.gaugeItem}>
                      <DialGauge 
                        value={airQuality.pm25} 
                        label="PM2.5" 
                        sensorType="airQuality"
                        dataType="pm25"
                        useAlertBasedRange={true}
                        size={dialGaugeSize} 
                        statusColor={getStatusColorForDial(airQuality.aqiLevel || airQuality.status, currentTheme)} 
                        coldColor={themeColors.successText} 
                        hotColor={themeColors.warningText} 
                      />
                    </ThemedView>
                    <ThemedView style={styles.gaugeItem}>
                      <DialGauge 
                        value={airQuality.pm10} 
                        label="PM10" 
                        sensorType="airQuality"
                        dataType="pm10"
                        useAlertBasedRange={true}
                        size={dialGaugeSize} 
                        statusColor={getStatusColorForDial(airQuality.aqiLevel || airQuality.status, currentTheme)} 
                        coldColor={themeColors.successText} 
                        hotColor={themeColors.warningText} 
                      />
                    </ThemedView>
                  </ThemedView>
                )}
              </ThemedView>
            </Card>
          )}

          {/* Thermal Imaging */}
          {thermalData && (
            <Card style={[styles.sectionCard, { backgroundColor: cardBackgroundColor }]}>
              <ThemedView style={styles.sectionHeader}>
                <ThemedView style={styles.sectionHeaderLeft}>
                  <ThemedView style={[styles.sectionIconContainer, { backgroundColor: themeColors.warningText + '15' }]}>
                    <Ionicons name="thermometer-outline" size={20} color={themeColors.warningText} />
                  </ThemedView>
                  <ThemedText style={[styles.sectionTitle, { color: sectionTitleColor }]}>
                    {thermalData.name || "Thermal Imaging"}
                  </ThemedText>
                </ThemedView>
              </ThemedView>

              <ThemedView style={styles.thermalContent}>
                <ThemedView style={styles.heatmapContainer}>
                  <HeatmapGrid 
                    data={thermalData.pixels} 
                    minTempThreshold={15} 
                    maxTempThreshold={45} 
                  />
                </ThemedView>
                
                <ThemedView style={styles.thermalStatsGrid}>
                  <ThemedView style={styles.thermalStatItem}>
                    <DialGauge 
                      value={thermalData.avgTemp} 
                      label="Avg Temp" 
                      sensorType="thermalImager"
                      dataType="avgTemp"
                      useAlertBasedRange={true}
                      size={Math.min(dialGaugeSize * 0.8, 90)} 
                      statusColor={getStatusColorForDial('normal', currentTheme)} 
                      coldColor={themeColors.accentLight} 
                      hotColor={themeColors.errorText} 
                    />
                  </ThemedView>
                  <ThemedView style={styles.thermalStatItem}>
                    <DialGauge 
                      value={thermalData.maxTemp} 
                      label="Max Temp" 
                      sensorType="thermalImager"
                      dataType="maxTemp"
                      useAlertBasedRange={true}
                      size={Math.min(dialGaugeSize * 0.8, 90)} 
                      statusColor={getStatusColorForDial('normal', currentTheme)} 
                      coldColor={themeColors.accentLight} 
                      hotColor={themeColors.errorText} 
                    />
                  </ThemedView>
                </ThemedView>
                
                <ThemedView style={[styles.thermalSummary, { backgroundColor: surfaceSecondaryColor }]}>
                  <ThemedView style={styles.thermalSummaryItem}>
                    <ThemedText style={[styles.thermalSummaryLabel, { color: iconColor }]}>Min</ThemedText>
                    <ThemedText style={[styles.thermalSummaryValue, { color: sectionTitleColor }]}>
                      {thermalData.minTemp.toFixed(1)}°C
                    </ThemedText>
                  </ThemedView>
                  <ThemedView style={[styles.thermalSummaryDivider, { backgroundColor: borderColor }]} />
                  <ThemedView style={styles.thermalSummaryItem}>
                    <ThemedText style={[styles.thermalSummaryLabel, { color: iconColor }]}>Avg</ThemedText>
                    <ThemedText style={[styles.thermalSummaryValue, { color: sectionTitleColor }]}>
                      {thermalData.avgTemp.toFixed(1)}°C
                    </ThemedText>
                  </ThemedView>
                  <ThemedView style={[styles.thermalSummaryDivider, { backgroundColor: borderColor }]} />
                  <ThemedView style={styles.thermalSummaryItem}>
                    <ThemedText style={[styles.thermalSummaryLabel, { color: iconColor }]}>Max</ThemedText>
                    <ThemedText style={[styles.thermalSummaryValue, { color: sectionTitleColor }]}>
                      {thermalData.maxTemp.toFixed(1)}°C
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
              </ThemedView>
            </Card>
          )}

          {/* Vibration Monitoring */}
          {vibrationData && (
            <Card style={[styles.sectionCard, { backgroundColor: cardBackgroundColor }]}>
              <ThemedView style={styles.sectionHeader}>
                <ThemedView style={styles.sectionHeaderLeft}>
                  <ThemedView style={[styles.sectionIconContainer, { backgroundColor: themeColors.accent + '15' }]}>
                    <Ionicons name="pulse-outline" size={20} color={themeColors.accent} />
                  </ThemedView>
                  <ThemedText style={[styles.sectionTitle, { color: sectionTitleColor }]}>
                    Vibration Analysis
                  </ThemedText>
                </ThemedView>
                <ThemedView style={[styles.statusIndicator, { backgroundColor: getStatusColor(vibrationData.status || 'normal') + '15' }]}>
                  <Ionicons 
                    name={getStatusIcon(vibrationData.status || 'normal')} 
                    size={14} 
                    color={getStatusColor(vibrationData.status || 'normal')} 
                  />
                </ThemedView>
              </ThemedView>

              <ThemedView style={styles.vibrationContent}>
                <ThemedView style={styles.vibrationGaugeContainer}>
                  <DialGauge 
                    value={vibrationData.rmsAcceleration} 
                    label="RMS Acceleration" 
                    sensorType="vibration"
                    dataType="rmsAcceleration"
                    useAlertBasedRange={true}
                    size={dialGaugeSize * 1.2} 
                    statusColor={getStatusColorForDial(vibrationData.status || 'normal', currentTheme)} 
                    coldColor={themeColors.successText} 
                    hotColor={themeColors.errorText} 
                  />
                </ThemedView>
                
                <ThemedView style={[styles.vibrationInfo, { backgroundColor: surfaceSecondaryColor }]}>
                  <ThemedView style={styles.vibrationInfoItem}>
                    <ThemedText style={[styles.vibrationInfoLabel, { color: iconColor }]}>
                      Sensor
                    </ThemedText>
                    <ThemedText style={[styles.vibrationInfoValue, { color: sectionTitleColor }]}>
                      {vibrationData.name || 'Vibration Sensor'}
                    </ThemedText>
                  </ThemedView>
                  <ThemedView style={styles.vibrationInfoItem}>
                    <ThemedText style={[styles.vibrationInfoLabel, { color: iconColor }]}>
                      Status
                    </ThemedText>
                    <ThemedText style={[styles.vibrationInfoValue, { color: getStatusColor(vibrationData.status || 'normal') }]}>
                      {(vibrationData.status || 'normal').toUpperCase()}
                    </ThemedText>
                  </ThemedView>
                </ThemedView>
              </ThemedView>
            </Card>
          )}
        </ThemedView>
      ) : (
        <Card style={[styles.emptyStateCard, { backgroundColor: cardBackgroundColor }]}>
          <ThemedView style={styles.emptyStateContent}>
            <Ionicons 
              name={selectedRoom === 'No Rooms Available' ? "home-outline" : "analytics-outline"} 
              size={64} 
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
        </Card>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Layout.spacing.md,
    backgroundColor: 'transparent',
  },
  
  // Header Card
  headerCard: {
    marginBottom: Layout.spacing.md,
    paddingVertical: Layout.spacing.lg,
    paddingHorizontal: Layout.spacing.lg,
  },
  headerContent: {
    backgroundColor: 'transparent',
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
  headerTitle: {
    fontSize: Layout.fontSize.xl,
    fontFamily: 'Montserrat-Bold',
    marginLeft: Layout.spacing.md,
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

  // Content Container
  contentContainer: {
    gap: Layout.spacing.md,
    backgroundColor: 'transparent',
  },

  // Section Cards
  sectionCard: {
    paddingVertical: Layout.spacing.lg,
    paddingHorizontal: Layout.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
    backgroundColor: 'transparent',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  sectionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: Layout.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.lg,
    fontFamily: 'Montserrat-Bold',
  },
  sensorCount: {
    backgroundColor: 'transparent',
  },
  sensorCountText: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Medium',
  },
  statusIndicator: {
    width: 32,
    height: 32,
    borderRadius: Layout.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Gauges Container
  gaugesContainer: {
    gap: Layout.spacing.lg,
    backgroundColor: 'transparent',
  },
  gaugeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: Layout.spacing.md,
    backgroundColor: 'transparent',
  },
  gaugeItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },

  // Thermal Content
  thermalContent: {
    gap: Layout.spacing.lg,
    backgroundColor: 'transparent',
  },
  heatmapContainer: {
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  thermalStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: Layout.spacing.md,
    backgroundColor: 'transparent',
  },
  thermalStatItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  thermalSummary: {
    flexDirection: 'row',
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.md,
    marginTop: Layout.spacing.sm,
  },
  thermalSummaryItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  thermalSummaryDivider: {
    width: 1,
    marginHorizontal: Layout.spacing.md,
  },
  thermalSummaryLabel: {
    fontSize: Layout.fontSize.xs,
    fontFamily: 'Montserrat-Medium',
    marginBottom: Layout.spacing.xs / 2,
  },
  thermalSummaryValue: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Bold',
  },

  // Vibration Content
  vibrationContent: {
    gap: Layout.spacing.lg,
    backgroundColor: 'transparent',
  },
  vibrationGaugeContainer: {
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  vibrationInfo: {
    flexDirection: 'row',
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.md,
  },
  vibrationInfoItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  vibrationInfoLabel: {
    fontSize: Layout.fontSize.xs,
    fontFamily: 'Montserrat-Medium',
    marginBottom: Layout.spacing.xs / 2,
  },
  vibrationInfoValue: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Bold',
  },

  // Empty State
  emptyStateCard: {
    paddingVertical: Layout.spacing.xxl,
    paddingHorizontal: Layout.spacing.lg,
    alignItems: 'center',
  },
  emptyStateContent: {
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  emptyStateIcon: {
    marginBottom: Layout.spacing.lg,
    opacity: 0.5,
  },
  emptyStateTitle: {
    fontSize: Layout.fontSize.xl,
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