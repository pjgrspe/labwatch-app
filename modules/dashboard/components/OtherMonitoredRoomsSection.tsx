// labwatch-app/modules/dashboard/components/OtherMonitoredRoomsSection.tsx
import { Card, SectionHeader, ThemedText, ThemedView } from '@/components';
import { Layout } from '@/constants';
import { useCurrentTheme, useThemeColor } from '@/hooks';
import { TempHumidityData } from '@/types/sensor';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { getStatusColorForDial } from '../utils/colorHelpers';

// Define OtherRoomData to include 'name' if it's not in TempHumidityData
interface OtherRoomData extends TempHumidityData {
  roomId: string;
  name: string; 
}

interface OtherMonitoredRoomsSectionProps {
  title: string;
  roomsData: OtherRoomData[];
  onPressViewAll: () => void;
}

const RoomCardDisplay: React.FC<{ room: OtherRoomData; onPress: () => void }> = ({ room, onPress }) => {
  const currentTheme = useCurrentTheme();
  const cardBackgroundColor = useThemeColor({}, 'cardBackground');
  const titleColor = useThemeColor({}, 'text');
  const subtitleColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'borderColor');
  
  const statusColor = getStatusColorForDial(room.status, currentTheme);
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical': return 'alert-circle';
      case 'warning': return 'warning';
      default: return 'checkmark-circle';
    }
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={styles.roomCardTouchable}>
      <Card style={[
        styles.roomCard,
        { 
          backgroundColor: cardBackgroundColor,
          borderColor: borderColor, // Default border for the card
          borderLeftColor: statusColor, // Status color for the left border
        }
      ]}>
        <ThemedView style={styles.roomCardContent}>
          <ThemedView style={styles.roomHeader}>
            <ThemedView style={[styles.roomIconContainer, { backgroundColor: statusColor + '15' }]}>
              <Ionicons name="business-outline" size={20} color={statusColor} />
            </ThemedView>
            
            <ThemedView style={styles.roomTextContainer}>
              <ThemedText style={[styles.roomTitle, { color: titleColor }]} numberOfLines={1}>
                {room.name || `Room ${room.roomId}`} 
              </ThemedText>
              <ThemedView style={styles.roomStatusContainer}>
                <Ionicons 
                  name={getStatusIcon(room.status)} 
                  size={12} 
                  color={statusColor} 
                />
                <ThemedText style={[styles.roomStatus, { color: statusColor }]}>
                  {room.status.toUpperCase()}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
            <ThemedView style={styles.roomMetrics}>
            <ThemedView style={styles.metricItem}>
              <Ionicons name="thermometer-outline" size={16} color={subtitleColor} />
              <ThemedText style={[styles.metricValue, { color: titleColor }]}>
                {room.temperature != null ? `${room.temperature.toFixed(1)}°C` : '--°C'}
              </ThemedText>
            </ThemedView>
            
            <ThemedView style={[styles.metricDivider, {backgroundColor: borderColor}]} />
            
            <ThemedView style={styles.metricItem}>
              <Ionicons name="water-outline" size={16} color={subtitleColor} />
              <ThemedText style={[styles.metricValue, { color: titleColor }]}>
                {room.humidity != null ? `${room.humidity.toFixed(0)}%` : '--%'}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </Card>
    </TouchableOpacity>
  );
};

const OtherMonitoredRoomsSection: React.FC<OtherMonitoredRoomsSectionProps> = ({
  title,
  roomsData,
  onPressViewAll,
}) => {
  const router = useRouter();
  const sectionTitleColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const cardBackgroundColor = useThemeColor({}, 'cardBackground');

  // Note: The parent dashboard.tsx's sectionWrapper handles horizontal padding.
  // This component's main container (styles.container) only needs to manage vertical layout.

  if (!roomsData || roomsData.length === 0) {
    return (
      <View style={styles.container}>
        <SectionHeader 
          title={title} 
          onPressViewAll={onPressViewAll} 
          // SectionHeader already has paddingHorizontal: Layout.spacing.lg.
          // If sectionWrapper in dashboard.tsx provides .md, this might be inconsistent.
          // Let's assume SectionHeader is fine or can be adjusted globally if needed.
        />
        {/* Empty state remains inside the section's padding */}
        <Card style={[styles.emptyStateCard, { backgroundColor: cardBackgroundColor }]} paddingSize="xl">
          <ThemedView style={styles.emptyStateContent}>
            <Ionicons name="grid-outline" size={48} color={iconColor} style={styles.emptyStateIcon} />
            <ThemedText style={[styles.emptyStateTitle, { color: sectionTitleColor }]}>
              No Other Rooms
            </ThemedText>
            <ThemedText style={[styles.emptyStateMessage, { color: iconColor }]}>
              All active rooms are shown in detail or add more rooms.
            </ThemedText>
          </ThemedView>
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SectionHeader 
        title={title} 
        onPressViewAll={onPressViewAll} 
      />      {roomsData.map(room => (
        <RoomCardDisplay
          key={room.roomId}
          room={room}
          onPress={() => {
            // Navigate to specific room detail page
            router.push(`/(tabs)/rooms/${room.roomId}` as any);
          }}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Layout.spacing.md, // Use sectionWrapper's padding
    // marginBottom is handled by spacers in dashboard.tsx or this component can add its own
    // If this section is the last one, FlatList's contentContainerStyle in dashboard.tsx provides paddingBottom.
  },
  // listContainer was removed as direct mapping is used.
  // Each RoomCardDisplay will need its own margin if 'gap' is not used.
  roomCardTouchable: {
    marginBottom: Layout.spacing.md, // Add margin between cards
  },
  roomCard: {
    borderLeftWidth: 4,
    // borderWidth: 1, // Card component adds a hairline border by default if not disabled
    borderRadius: Layout.borderRadius.lg, // Card component handles this
    // overflow: 'hidden', // Card might handle this or not needed
    // ...Layout.cardShadow, // Card component handles shadow
  },
  roomCardContent: {
    padding: Layout.spacing.md, // Card component handles padding via paddingSize prop, but this allows override
    backgroundColor: 'transparent',
  },
  roomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
    backgroundColor: 'transparent',
  },
  roomIconContainer: {
    width: 40,
    height: 40,
    borderRadius: Layout.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
  },
  roomTextContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  roomTitle: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: Layout.spacing.xs / 2,
  },
  roomStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  roomStatus: {
    fontSize: Layout.fontSize.xs,
    fontFamily: 'Montserrat-Bold',
    marginLeft: Layout.spacing.xs / 2,
  },
  roomMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'transparent',
  },
  metricValue: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-SemiBold',
    marginLeft: Layout.spacing.xs,
  },
  metricDivider: {
    width: StyleSheet.hairlineWidth, // Use hairlineWidth for subtle dividers
    height: '60%', // Make it relative to content
    alignSelf: 'center',
    // backgroundColor is set by useThemeColor -> borderColor
    marginHorizontal: Layout.spacing.sm, // Reduced margin
  },
  emptyStateCard: {
    // paddingVertical: Layout.spacing.xl, // Card handles padding via paddingSize
    // paddingSize: "xl", // This prop is passed directly to the Card component
    alignItems: 'center',
    // No marginHorizontal, sectionWrapper in dashboard.tsx handles it.
    marginTop: Layout.spacing.md, // Space from SectionHeader
  },
  emptyStateContent: {
    alignItems: 'center',
    backgroundColor: 'transparent',
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

export default OtherMonitoredRoomsSection;