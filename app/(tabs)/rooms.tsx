// app/(tabs)/rooms.tsx
import { View as ThemedView } from '@/components/Themed';
import { useThemeColor } from '@/hooks/useThemeColor';
import RoomList from '@/modules/rooms/components/RoomList';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

export default function RoomsScreen() {
  const router = useRouter();
  const containerBackgroundColor = useThemeColor({}, 'background');
  const fabBackgroundColor = useThemeColor({}, 'tint');

  const handleAddRoom = () => {
    router.push('/modals/add-room');
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: containerBackgroundColor }]}>
      <ScrollView>
        <RoomList />
      </ScrollView>
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: fabBackgroundColor }]}
        onPress={handleAddRoom}
      >
        <Ionicons name="add-outline" size={30} color="#FFFFFF" />
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    elevation: 8, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});