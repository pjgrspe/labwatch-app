// modules/rooms/components/RoomList.tsx
import Card from '@/components/Card';
import ListItem from '@/components/ListItem';
import { Text as ThemedText } from '@/components/Themed';
import { useThemeColor } from '@/hooks/useThemeColor';
import React, { useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';

interface Room {
  id: string;
  name: string;
  location: string;
  isMonitored: boolean;
}

const DUMMY_ROOMS: Room[] = [
  { id: 'room1', name: 'Lab Alpha', location: 'Building A, Floor 1', isMonitored: true },
  { id: 'room2', name: 'Cold Storage 003', location: 'Building A, Basement', isMonitored: false },
  { id: 'room3', name: 'Microscopy Suite', location: 'Building B, Floor 2', isMonitored: true },
  { id: 'room4', name: 'Chem Prep Room', location: 'Building A, Floor 1', isMonitored: false },
];

export default function RoomList() {
  const [rooms, setRooms] = useState<Room[]>(DUMMY_ROOMS);
  const sectionTitleColor = useThemeColor({ light: '#4A4A4A', dark: '#CCCCCC' }, 'text');
  const switchThumbColorEnabled = useThemeColor({ light: "#f5dd4b", dark: "#f5dd4b" }, 'tint');
  const switchThumbColorDisabled = useThemeColor({ light: "#f4f3f4", dark: "#767577" }, 'icon');
  const switchTrackColorTrue = useThemeColor({ light: "#81b0ff", dark: "#585858" }, 'tint');
  const switchTrackColorFalse = useThemeColor({ light: "#767577", dark: "#3e3e3e" }, 'icon');
  const switchIosBackgroundColor = useThemeColor({ light: "#3e3e3e", dark: "#1c1c1e" }, 'background');


  const toggleMonitorSwitch = (roomId: string) => {
    setRooms(prevRooms =>
      prevRooms.map(room =>
        room.id === roomId ? { ...room, isMonitored: !room.isMonitored } : room
      )
    );
    // Here you would typically also make an API call to update the monitoring status
    // console.log(`Room ${roomId} monitoring toggled to ${!rooms.find(r => r.id === roomId)?.isMonitored}`);
  };

  const renderItem = ({ item }: { item: Room }) => (
    <Card style={styles.roomCard}>
      <ListItem
        title={item.name}
        subtitle={item.location}
        rightIconName={item.isMonitored ? "eye-outline" : "eye-off-outline"}
        showBorder={false} // Card already provides separation
      />
    </Card>
  );

  return (
    <>
      <ThemedText style={[styles.sectionTitle, { color: sectionTitleColor }]}>Select Rooms to Monitor</ThemedText>
      <FlatList
        data={rooms}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        scrollEnabled={false} // If this list is inside another ScrollView
      />
    </>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 12,
    paddingHorizontal: 16,
  },
  roomCard: {
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switch: {
    marginLeft: 10, // Add some spacing if ListItem doesn't handle it
  }
});