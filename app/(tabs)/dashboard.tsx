// app/(tabs)/dashboard.tsx
import { Colors, Layout } from '@/constants';
import { useCurrentTheme, useThemeColor } from '@/hooks';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

// Import modular components and hook
import DashboardHeader from '@/modules/dashboard/components/DashboardHeader';
import OtherMonitoredRoomsSection from '@/modules/dashboard/components/OtherMonitoredRoomsSection';
import QuickActionsCarousel from '@/modules/dashboard/components/QuickActionsCarousel';
import RecentAlertsSection from '@/modules/dashboard/components/RecentAlertsSection';
import RoomDetailCard from '@/modules/dashboard/components/RoomDetailCard';
import { useDashboardData } from '@/modules/dashboard/hooks/useDashboardData';

// Define DashboardSectionType and DashboardSection interface
type DashboardSectionType =
  | 'ROOM_DETAILS'
  | 'QUICK_ACTIONS_CAROUSEL'
  | 'RECENT_ALERTS_SECTION'
  | 'OTHER_MONITORED_ROOMS_SECTION'
  | 'SPACER';

interface DashboardSection {
  id: string;
  type: DashboardSectionType;
  data?: any;
  height?: number;
}

export default function DashboardScreen() {
  const router = useRouter();
  const currentTheme = useCurrentTheme();
  const themeColors = Colors[currentTheme];
  const scrollViewBackgroundColor = useThemeColor({}, 'background');

  const {
    selectedRoomId,
    setSelectedRoomId,
    availableRooms,
    selectedRoomTempHumidity,
    selectedRoomAirQuality,
    selectedRoomThermalData,
    hasAnySensorDataForSelectedRoom,
    recentAlerts,
    otherMonitoredRooms,
    refreshing,
    onRefresh,
  } = useDashboardData();

  const dashboardSections = React.useMemo((): DashboardSection[] => [
    {
      id: 'room-details',
      type: 'ROOM_DETAILS',
      data: {
        rooms: availableRooms,
        selectedRoom: selectedRoomId,
        onSelectRoom: setSelectedRoomId,
        tempHumidity: selectedRoomTempHumidity,
        airQuality: selectedRoomAirQuality,
        thermalData: selectedRoomThermalData,
        hasAnyData: hasAnySensorDataForSelectedRoom,
      },
    },
    { id: 'spacer-1', type: 'SPACER', height: Layout.spacing.lg },
    { id: 'quick-actions-carousel', type: 'QUICK_ACTIONS_CAROUSEL' },
    { id: 'spacer-2', type: 'SPACER', height: Layout.spacing.lg },
    {
      id: 'recent-alerts',
      type: 'RECENT_ALERTS_SECTION',
      data: {
        title: 'Recent Alerts',
        alerts: recentAlerts.slice(0, 3),
        onPressViewAll: () => router.push('/(tabs)/alerts'),
      },
    },
    { id: 'spacer-3', type: 'SPACER', height: Layout.spacing.lg },
    {
      id: 'other-rooms',
      type: 'OTHER_MONITORED_ROOMS_SECTION',
      data: {
        title: 'Other Active Rooms',
        roomsData: otherMonitoredRooms,
        onPressViewAll: () => router.push('/(tabs)/rooms'),
      },
    },
    { id: 'spacer-bottom', type: 'SPACER', height: Layout.spacing.xxl },
  ], [
    availableRooms, selectedRoomId, setSelectedRoomId,
    selectedRoomTempHumidity, selectedRoomAirQuality, selectedRoomThermalData,
    hasAnySensorDataForSelectedRoom, recentAlerts, otherMonitoredRooms, router
  ]);

  const renderDashboardSection = ({ item }: { item: DashboardSection }) => {
    // Apply consistent horizontal padding to all major sections
    // RoomDetailCard itself is substantial, so it also gets wrapped for consistent spacing.
    // Spacers don't need this wrapper.

    const content = () => {
        switch (item.type) {
            case 'ROOM_DETAILS':
                return <RoomDetailCard {...item.data} />;
            case 'QUICK_ACTIONS_CAROUSEL':
                return <QuickActionsCarousel />;
            case 'RECENT_ALERTS_SECTION':
                return <RecentAlertsSection {...item.data} />;
            case 'OTHER_MONITORED_ROOMS_SECTION':
                return <OtherMonitoredRoomsSection {...item.data} />;
            case 'SPACER':
                return <View style={{ height: item.height }} />;
            default:
                return null;
        }
    };

    return content();
  };

  return (
    <View style={[styles.container, { backgroundColor: scrollViewBackgroundColor }]}>
      <FlatList
        data={dashboardSections}
        renderItem={renderDashboardSection}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<DashboardHeader />} // Assuming DashboardHeader handles its own padding if needed
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.flatListContentContainer} // Overall padding for the list
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={themeColors.tint}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatListContentContainer: {
    // Apply top padding here if DashboardHeader doesn't have its own bottom margin,
    // or if a general top padding for the scrollable content is desired.
    // For example: paddingTop: Layout.spacing.md,
    paddingBottom: Layout.spacing.xl, // For scroll-past-content space
  }
});