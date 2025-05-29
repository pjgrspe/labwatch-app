// app/(tabs)/rooms/index.tsx
import { View as ThemedView } from '@/components/Themed';
import Layout from '@/constants/Layout'; // Import Layout
import { useCurrentTheme, useThemeColor } from '@/hooks/useThemeColor'; // Ensure useCurrentTheme is imported
import RoomList from '@/modules/rooms/components/RoomList';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

export default function RoomsListScreen() {
  const router = useRouter();
  const containerBackgroundColor = useThemeColor({}, 'background');
  const fabBackgroundColor = useThemeColor({}, 'tint');
  const fabIconColor = useThemeColor({}, 'primaryButtonText'); // Changed for better contrast on tint
  const headerIconColor = useThemeColor({}, 'headerTint');
  const theme = useCurrentTheme();
  const shadowStyle = theme === 'light' ? Layout.cardShadow : Layout.darkCardShadow;


  const handleAddRoom = () => {
    router.push('/modals/add-room');
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Lab Rooms',
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/rooms/archived')}
              style={{ marginRight: Layout.spacing.md }}
            >
              <Ionicons name="archive-outline" size={26} color={headerIconColor} />
            </TouchableOpacity>
          ),
        }}
      />
      <ThemedView style={[styles.container, { backgroundColor: containerBackgroundColor }]}>
        <RoomList />
        <TouchableOpacity
          style={[
            styles.fab,
            { backgroundColor: fabBackgroundColor },
            shadowStyle
          ]}
          onPress={handleAddRoom}
          activeOpacity={0.8}
        >
          {/* Changed to solid 'add' icon for primary action */}
          <Ionicons name="add" size={32} color={fabIconColor} />
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
    margin: Layout.spacing.lg, // Consistent spacing
    right: Layout.spacing.md,
    bottom: Layout.spacing.md,
    width: 60,
    height: 60,
    borderRadius: 30, // Fully circular
    alignItems: 'center',
    justifyContent: 'center',
    // Shadow properties are now applied via shadowStyle
    zIndex: 10,
  },
});