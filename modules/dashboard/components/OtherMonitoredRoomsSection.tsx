// labwatch-app/modules/dashboard/components/OtherMonitoredRoomsSection.tsx
import Card from '@/components/Card'; //
import SectionHeader from '@/components/SectionHeader';
import { Text as ThemedText, View as ThemedView } from '@/components/Themed'; //
import Layout from '@/constants/Layout'; //
import { useCurrentTheme, useThemeColor } from '@/hooks/useThemeColor'; //
import { TempHumidityData } from '@/types/sensor'; //
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { getStatusColorForDial } from '../utils/colorHelpers'; // Assuming you created this

interface OtherRoomData extends TempHumidityData {
  roomId: string;
}

interface OtherMonitoredRoomsSectionProps {
  title: string;
  roomsData: OtherRoomData[];
  onPressViewAll: () => void;
}

const OtherMonitoredRoomsSection: React.FC<OtherMonitoredRoomsSectionProps> = ({
  title,
  roomsData,
  onPressViewAll,
}) => {
  const sectionTitleColor = useThemeColor({}, 'text'); //
  const currentTheme = useCurrentTheme();

  if (!roomsData || roomsData.length === 0) {
    return (
      <View style={styles.container}>
        <SectionHeader title={title} onPressViewAll={onPressViewAll} />
         <View style={styles.listItemContainer}>
            <Card style={styles.cardWithPadding}>
                <ThemedText style={[styles.noDataText, { color: sectionTitleColor }]}>
                    No other environments being monitored.
                </ThemedText>
            </Card>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SectionHeader title={title} onPressViewAll={onPressViewAll} />
      <View style={styles.listItemContainer}>
        {roomsData.map(sensor => (
          <Card key={sensor.id} style={styles.environmentCard}>
            <Ionicons
              name="cube-outline"
              size={24}
              color={getStatusColorForDial(sensor.status, currentTheme)}
              style={styles.environmentCardIcon}
            />
            <ThemedView style={styles.environmentCardTextContainer}>
              <ThemedText style={[styles.environmentCardTitle, { color: sectionTitleColor }]}>
                {sensor.name}
              </ThemedText>
              <ThemedText style={[styles.environmentCardSubtitle, { color: getStatusColorForDial(sensor.status, currentTheme) }]}>
                {sensor.temperature}°C / {sensor.humidity}% - {sensor.status}
              </ThemedText>
            </ThemedView>
          </Card>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
   container: {
    // No specific styles needed here if children handle padding
  },
  listItemContainer: { //
    paddingHorizontal: Layout.spacing.md,
  },
  environmentCard: { //
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
    padding: Layout.spacing.md,
  },
  environmentCardIcon: { //
    marginRight: Layout.spacing.md,
  },
  environmentCardTextContainer: { //
    flex: 1,
    backgroundColor: 'transparent',
  },
  environmentCardTitle: { //
    fontSize: Layout.fontSize.md,
    fontWeight: Layout.fontWeight.semibold,
  },
  environmentCardSubtitle: { //
    fontSize: Layout.fontSize.sm,
    marginTop: Layout.spacing.xs,
  },
  cardWithPadding: { //
    // marginHorizontal already handled by listItemContainer
    marginBottom: Layout.spacing.lg,
    padding: Layout.spacing.lg,
  },
  noDataText: { //
    textAlign: 'center',
    paddingVertical: Layout.spacing.lg,
    fontSize: Layout.fontSize.md,
  },
});

export default OtherMonitoredRoomsSection;