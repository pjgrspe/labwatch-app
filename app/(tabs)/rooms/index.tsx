// app/(tabs)/rooms/index.tsx
import { View as ThemedView } from '@/components/Themed';
import Layout from '@/constants/Layout';
import { useThemeColor } from '@/hooks/useThemeColor';
import RoomList from '@/modules/rooms/components/RoomList';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

export default function RoomsListScreen() { 
  const router = useRouter();
  const containerBackgroundColor = useThemeColor({}, 'background');
  const fabBackgroundColor = useThemeColor({}, 'tint');
  const fabIconColor = useThemeColor({}, 'text');
  const headerIconColor = useThemeColor({}, 'headerTint'); // For header right button

  const handleAddRoom = () => {
    router.push('/modals/add-room');
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Rooms',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/rooms/archived')}
              style={{ marginRight: Layout.spacing.md }}
            >
              <Ionicons name="archive-outline" size={24} color={headerIconColor} />
            </TouchableOpacity>
          ),
        }}
      />
      <ThemedView style={[styles.container, { backgroundColor: containerBackgroundColor }]}>
        <RoomList />
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: fabBackgroundColor }]}
          onPress={handleAddRoom}
          activeOpacity={0.8}
        >
          <Ionicons name="add-outline" size={30} color={fabIconColor} />
        </TouchableOpacity>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: Layout.spacing.lg,
    right: Layout.spacing.sm,
    bottom: Layout.spacing.sm,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 10,
  },
});