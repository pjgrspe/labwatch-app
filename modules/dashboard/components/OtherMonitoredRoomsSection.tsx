import Card from '@/components/Card';
import SectionHeader from '@/components/SectionHeader';
import { Text as ThemedText, View as ThemedView } from '@/components/Themed';
import Layout from '@/constants/Layout';
import { useCurrentTheme, useThemeColor } from '@/hooks/useThemeColor';
import { TempHumidityData } from '@/types/sensor';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { getStatusColorForDial } from '../utils/colorHelpers';

interface OtherRoomData extends TempHumidityData {
  roomId: string;
}

interface OtherMonitoredRoomsSectionProps {
  title: string;
  roomsData: OtherRoomData[];
  onPressViewAll: () => void;
}

const RoomCard: React.FC<{ room: OtherRoomData; onPress: () => void }> = ({ room, onPress }) => {
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
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card style={[
        styles.roomCard,
        { 
          backgroundColor: cardBackgroundColor,
          borderColor: borderColor,
          borderLeftColor: statusColor,
        }
      ]}>
        <ThemedView style={styles.roomCardContent}>
          <ThemedView style={styles.roomHeader}>
            <ThemedView style={[styles.roomIconContainer, { backgroundColor: statusColor + '15' }]}>
              <Ionicons name="business-outline" size={20} color={statusColor} />
            </ThemedView>
            
            <ThemedView style={styles.roomTextContainer}>
              <ThemedText style={[styles.roomTitle, { color: titleColor }]} numberOfLines={1}>
                {room.name}
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
                {room.temperature.toFixed(1)}°C
              </ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.metricDivider} />
            
            <ThemedView style={styles.metricItem}>
              <Ionicons name="water-outline" size={16} color={subtitleColor} />
              <ThemedText style={[styles.metricValue, { color: titleColor }]}>
                {room.humidity.toFixed(0)}%
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
  const sectionTitleColor = useThemeColor({}, 'text');
  const cardBackgroundColor = useThemeColor({}, 'cardBackground');

  if (!roomsData || roomsData.length === 0) {
    return (
      <View style={styles.container}>
        <SectionHeader 
          title={title} 
          onPressViewAll={onPressViewAll} 
        />
        <View style={styles.listContainer}>
          <Card style={[styles.emptyStateCard, { backgroundColor: cardBackgroundColor }]}>
            <ThemedView style={styles.emptyStateContent}>
              <Ionicons name="add-circle-outline" size={48} color={sectionTitleColor} style={styles.emptyStateIcon} />
              <ThemedText style={[styles.emptyStateTitle, { color: sectionTitleColor }]}>
                No Other Rooms
              </ThemedText>
              <ThemedText style={[styles.emptyStateMessage, { color: sectionTitleColor }]}>
                Add more rooms to expand your monitoring coverage.
              </ThemedText>
            </ThemedView>
          </Card>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
    <View style={styles.container}>
      <SectionHeader 
        title={title} 
        onPressViewAll={onPressViewAll} 
      />
        {roomsData.map(room => (
          <RoomCard
            key={room.roomId}
            room={room}
            onPress={() => {
              // Navigate to specific room detail
              // router.push(`/(tabs)/rooms/${room.roomId}`);
              onPressViewAll(); // For now, go to rooms list
            }}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Layout.spacing.sm,
  },
  listContainer: {
    paddingHorizontal: Layout.spacing.md,
    gap: Layout.spacing.sm,
  },
  roomCard: {
    borderLeftWidth: 4,
    borderWidth: 1,
    borderRadius: Layout.borderRadius.lg,
    overflow: 'hidden',
    ...Layout.cardShadow,
  },
  roomCardContent: {
    padding: Layout.spacing.md,
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
    width: 1,
    height: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginHorizontal: Layout.spacing.md,
  },
  emptyStateCard: {
    paddingVertical: Layout.spacing.xl,
    alignItems: 'center',
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