// labwatch-app/modules/dashboard/components/RoomDetailCard.tsx
import Card from '@/components/Card'; //
import RoomSelectorDropdown from '@/components/dashboard/RoomSelectorDropdown'; //
import { Text as ThemedText, View as ThemedView } from '@/components/Themed'; //
import DialGauge from '@/components/ui/DialGauge'; //
import HeatmapGrid from '@/components/ui/HeatmapGrid'; //
import { Colors } from '@/constants/Colors'; //
import Layout from '@/constants/Layout'; //
import { useCurrentTheme, useThemeColor } from '@/hooks/useThemeColor'; //
import { AirQualityData, TempHumidityData, ThermalImagerData } from '@/types/sensor'; //
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { getStatusColorForDial } from '../utils/colorHelpers'; // Assuming you created this

interface RoomDetailCardProps {
  rooms: string[];
  selectedRoom: string;
  onSelectRoom: (room: string) => void;
  tempHumidity?: TempHumidityData;
  airQuality?: AirQualityData;
  thermalData?: ThermalImagerData;
  hasAnyData: boolean;
}

const RoomDetailCard: React.FC<RoomDetailCardProps> = ({
  rooms,
  selectedRoom,
  onSelectRoom,
  tempHumidity,
  airQuality,
  thermalData,
  hasAnyData,
}) => {
  const sectionTitleColor = useThemeColor({}, 'text');
  const currentTheme = useCurrentTheme();
  const cardContentWidth = Layout.window.width - (Layout.spacing.md * 2) - (Layout.spacing.lg * 2); //
  const dialGaugeSize = Math.max(120, cardContentWidth / 2 - (Layout.spacing.md * 2)); //

  return (
    <Card style={styles.combinedCardStyle}>
      <RoomSelectorDropdown
        rooms={rooms}
        selectedRoom={selectedRoom}
        onSelectRoom={onSelectRoom}
        // headerText prop was removed, so no need to pass it
      />
      <View style={styles.divider} />

      {selectedRoom !== 'No Rooms Available' && hasAnyData && (
        <>
          {(tempHumidity || airQuality) && (
            <>
              <ThemedText style={[styles.subSectionTitle, { color: sectionTitleColor }]}>
                Environmental Conditions
              </ThemedText>
              <View style={styles.gaugesGrid}>
                {tempHumidity ? (
                  <View style={styles.gaugePairContainer}>
                    <DialGauge value={tempHumidity.temperature} label="Temperature" unit="°C" size={dialGaugeSize} statusColor={getStatusColorForDial(tempHumidity.status, currentTheme)} coldColor="#3B82F6" hotColor="#EF4444" dangerLevel={tempHumidity.status === 'warning' ? (tempHumidity.temperature > 0 ? 30 : -10) : undefined} />
                    <DialGauge value={tempHumidity.humidity} label="Humidity" unit="%" size={dialGaugeSize} statusColor={getStatusColorForDial(tempHumidity.status, currentTheme)} coldColor="#3B82F6" hotColor="#A855F7" dangerLevel={tempHumidity.status === 'warning' ? 60 : undefined} />
                  </View>
                ) : (
                  <View style={styles.noDataGaugePlaceholderSingle}><ThemedText style={[styles.noDataTextSmall, { color: sectionTitleColor }]}>No Temp/Humidity data.</ThemedText></View>
                )}
                {airQuality ? (
                  <View style={styles.gaugePairContainer}>
                    <DialGauge value={airQuality.pm25} label="PM2.5" unit="µg/m³" max={150} size={dialGaugeSize} statusColor={getStatusColorForDial(airQuality.aqiLevel || airQuality.status, currentTheme)} coldColor="#4ADE80" hotColor="#F59E0B" dangerLevel={airQuality.aqiLevel === 'unhealthy_sensitive' ? 35.5 : (airQuality.aqiLevel === 'unhealthy' ? 55.5 : undefined)} />
                    <DialGauge value={airQuality.pm10} label="PM10" unit="µg/m³" max={250} size={dialGaugeSize} statusColor={getStatusColorForDial(airQuality.aqiLevel || airQuality.status, currentTheme)} coldColor="#4ADE80" hotColor="#F59E0B" dangerLevel={airQuality.aqiLevel === 'unhealthy_sensitive' ? 155 : (airQuality.aqiLevel === 'unhealthy' ? 255 : undefined)} />
                  </View>
                ) : (
                   <View style={styles.noDataGaugePlaceholderSingle}><ThemedText style={[styles.noDataTextSmall, { color: sectionTitleColor }]}>No Air Quality data.</ThemedText></View>
                )}
              </View>
            </>
          )}

          {thermalData && (
            <>
              <View style={styles.dividerSubtle} />
              <ThemedText style={[styles.subSectionTitle, { color: sectionTitleColor }]}>
                {thermalData.name}
              </ThemedText>
              <HeatmapGrid data={thermalData.pixels} minTempThreshold={15} maxTempThreshold={45} />
              <ThemedView style={styles.thermalStatsContainer}>
                 <ThemedText style={[styles.thermalStatText, { color: sectionTitleColor }]}>Min: {thermalData.minTemp.toFixed(1)}°C</ThemedText>
                 <ThemedText style={[styles.thermalStatText, { color: sectionTitleColor }]}>Avg: {thermalData.avgTemp.toFixed(1)}°C</ThemedText>
                 <ThemedText style={[styles.thermalStatText, { color: sectionTitleColor }]}>Max: {thermalData.maxTemp.toFixed(1)}°C</ThemedText>
              </ThemedView>
            </>
          )}
        </>
      )}
      {selectedRoom !== 'No Rooms Available' && !hasAnyData && (
        <ThemedText style={[styles.noDataText, { color: sectionTitleColor, paddingTop: Layout.spacing.md }]}>
          No sensor data available for {selectedRoom}.
        </ThemedText>
      )}
       {selectedRoom === 'No Rooms Available' && (
           <ThemedText style={[styles.noDataText, { color: sectionTitleColor, paddingTop: Layout.spacing.md }]}>
              Please select a room to view details.
           </ThemedText>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  combinedCardStyle: { //
    marginVertical: Layout.spacing.md,
    marginHorizontal: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
    paddingTop: Layout.spacing.sm,
    paddingBottom: Layout.spacing.lg,
    paddingHorizontal: Layout.spacing.md,
    zIndex: 1,
  },
  divider: { //
    height: 1,
    backgroundColor: Colors.light.borderColor,
    marginVertical: Layout.spacing.md,
  },
  dividerSubtle: { //
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.light.borderColor,
    marginVertical: Layout.spacing.md,
    marginHorizontal: -Layout.spacing.md,
  },
  subSectionTitle: { //
    fontSize: Layout.fontSize.lg,
    fontWeight: Layout.fontWeight.semibold,
    marginBottom: Layout.spacing.sm,
  },
  gaugesGrid: { //
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
  },
  gaugePairContainer: { //
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: Layout.spacing.xs,
  },
  noDataGaugePlaceholderSingle: { //
    flex: 1,
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.sm,
  },
  thermalStatsContainer: { //
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Layout.spacing.md,
    backgroundColor: 'transparent',
    paddingVertical: Layout.spacing.sm,
  },
  thermalStatText: { //
    fontSize: Layout.fontSize.sm,
    fontWeight: Layout.fontWeight.medium,
  },
  noDataText: { //
    textAlign: 'center',
    paddingVertical: Layout.spacing.lg,
    fontSize: Layout.fontSize.md,
  },
  noDataTextSmall: { //
    textAlign: 'center',
    fontSize: Layout.fontSize.sm,
    paddingVertical: Layout.spacing.sm,
    fontStyle: 'italic',
  },
});

export default RoomDetailCard;