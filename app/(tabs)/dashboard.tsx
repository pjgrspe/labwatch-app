// app/(tabs)/index.tsx
import { Colors } from '@/constants/Colors'; //
import Layout from '@/constants/Layout'; //
import { useCurrentTheme, useThemeColor } from '@/hooks/useThemeColor'; //
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

// Define DashboardSectionType and DashboardSection interface here or import from a types file
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
  height?: number; // For spacers
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
    { id: 'spacer-1', type: 'SPACER', height: Layout.spacing.xs },
    { id: 'quick-actions-carousel', type: 'QUICK_ACTIONS_CAROUSEL' },
    { id: 'spacer-2', type: 'SPACER', height: Layout.spacing.lg },
    {
      id: 'recent-alerts',
      type: 'RECENT_ALERTS_SECTION',
      data: {
        title: 'Recent Alerts',
        alerts: recentAlerts.slice(0,3), // Use data from hook
        onPressViewAll: () => router.push('/(tabs)/alerts'),
      },
    },
    { id: 'spacer-3', type: 'SPACER', height: Layout.spacing.lg },
    {
      id: 'other-rooms',
      type: 'OTHER_MONITORED_ROOMS_SECTION',
      data: {
        title: 'Other Monitored Rooms',
        roomsData: otherMonitoredRooms, // Use data from hook
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
    switch (item.type) {
      case 'ROOM_DETAILS':
        return <RoomDetailCard {...item.data} />;
      case 'QUICK_ACTIONS_CAROUSEL':
        // Pass necessary props to QuickActionsCarousel if it's now a standalone section
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

  return (
    <View style={{ flex: 1, backgroundColor: scrollViewBackgroundColor }}>
      <FlatList
        data={dashboardSections}
        renderItem={renderDashboardSection}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<DashboardHeader currentTheme={currentTheme}/>}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.flatListContentContainer}
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
  flatListContentContainer: { //
    paddingTop: Layout.spacing.md,
  },
  // Other styles specific to this screen if any, or remove if all are component-specific
});