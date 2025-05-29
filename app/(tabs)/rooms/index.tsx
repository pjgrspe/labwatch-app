// app/(tabs)/rooms/index.tsx
import { ThemedView } from '@/components';
import { Layout } from '@/constants';
import { useCurrentTheme, useThemeColor } from '@/hooks';
import RoomList from '@/modules/rooms/components/RoomList';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

export default function RoomsListScreen() {
  const router = useRouter();
  const containerBackgroundColor = useThemeColor({}, 'background');
  const fabBackgroundColor = useThemeColor({}, 'tint');
  const fabIconColor = useThemeColor({}, 'primaryButtonText');
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
              style={styles.headerButton}
            >
              <Ionicons name="archive-outline" size={24} color={headerIconColor} />
            </TouchableOpacity>
          ),
        }}
      />
      <ThemedView style={[styles.container, { backgroundColor: containerBackgroundColor }]}>
        <RoomList />
        
        {/* Enhanced FAB with better positioning and styling */}
        <TouchableOpacity
          style={[
            styles.fab,
            { backgroundColor: fabBackgroundColor },
            shadowStyle
          ]}
          onPress={handleAddRoom}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color={fabIconColor} />
        </TouchableOpacity>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerButton: {
    marginRight: Layout.spacing.sm,
    padding: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.sm,
  },
  fab: {
    position: 'absolute',
    right: Layout.spacing.lg,
    bottom: Layout.spacing.lg + 20, // Account for tab bar
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    zIndex: 10,
  },
});