// labwatch-app/app/(tabs)/rooms/archived.tsx
import Card from '@/components/Card';
import { Text as ThemedText, View as ThemedView } from '@/components/Themed'; // Added ThemedView
import { Colors } from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { useCurrentTheme, useThemeColor } from '@/hooks/useThemeColor';
import { RoomService } from '@/modules/rooms/services/RoomService';
import { Room } from '@/types/rooms';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';

export default function ArchivedRoomsScreen() {
  const router = useRouter();
  const [archivedRooms, setArchivedRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const currentTheme = useCurrentTheme();
  const themeColors = Colors[currentTheme]; // Correctly get theme-specific colors
  const containerBackgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtleTextColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');
  const errorColor = useThemeColor({}, 'errorText');
  const successColor = useThemeColor({}, 'successText');
  const cardBackgroundColor = useThemeColor({}, 'cardBackground');
  const sectionTitleColor = useThemeColor({ light: '#4A4A4A', dark: '#CCCCCC' }, 'text');


  const fetchArchivedRooms = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setIsLoading(true);
    try {
      const rooms = await RoomService.getArchivedRooms();
      setArchivedRooms(rooms);
    } catch (error) {
      console.error('Failed to fetch archived rooms:', error);
      Alert.alert('Error', 'Failed to load archived rooms.');
    } finally {
      if (!isRefresh) setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchArchivedRooms();
    const unsubscribe = RoomService.onArchivedRoomsUpdate(
      (updatedRooms) => {
        setArchivedRooms(updatedRooms);
        if (isLoading) setIsLoading(false);
        if (refreshing) setRefreshing(false);
      },
      (error) => {
        console.error("Error listening to archived room updates:", error);
        if (isLoading) setIsLoading(false);
        if (refreshing) setRefreshing(false);
      }
    );
    return () => unsubscribe();
  }, [fetchArchivedRooms]); // fetchArchivedRooms is stable

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchArchivedRooms(true);
  }, [fetchArchivedRooms]);

  const handleRestoreRoom = (room: Room) => {
    Alert.alert(
      'Restore Room',
      `Are you sure you want to restore "${room.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'default',
          onPress: async () => {
            try {
              await RoomService.restoreRoom(room.id);
              Alert.alert('Success', `Room "${room.name}" has been restored.`);
              // Listener will update the list
            } catch (error: any) {
              console.error('Failed to restore room:', error);
              Alert.alert('Error', error.message || 'Failed to restore room.');
            }
          },
        },
      ]
    );
  };

  const handleDeleteRoom = (room: Room) => {
    Alert.alert(
      'Delete Room Permanently',
      `Are you sure you want to permanently delete "${room.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Permanently',
          style: 'destructive',
          onPress: async () => {
            try {
              await RoomService.deleteRoom(room.id);
              Alert.alert('Success', `Room "${room.name}" has been permanently deleted.`);
              // Listener will update the list
            } catch (error: any) {
              console.error('Failed to delete room:', error);
              Alert.alert('Error', error.message || 'Failed to delete room.');
            }
          },
        },
      ]
    );
  };

  const renderArchivedRoom = ({ item: room }: { item: Room }) => (
    <Card style={[styles.roomItemCard, { backgroundColor: cardBackgroundColor }]}>
      <ThemedView style={styles.listItemContent}> {/* Use ThemedView */}
        <ThemedView style={styles.roomInfo}> {/* Use ThemedView */}
          <ThemedText style={[styles.roomName, { color: sectionTitleColor }]}>
            {room.name}
          </ThemedText>
          <ThemedText style={[styles.roomLocation, { color: subtleTextColor }]}>
            {room.location}
          </ThemedText>
          <ThemedText style={[styles.archivedDate, { color: subtleTextColor }]}>
            Archived: {room.archivedAt ? new Date(room.archivedAt as any).toLocaleDateString() : 'N/A'}
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.roomActions}> {/* Use ThemedView */}
          <TouchableOpacity
            onPress={() => handleRestoreRoom(room)}
            style={[styles.iconButton, { borderColor: successColor }]}
          >
            <Ionicons name="refresh-outline" size={24} color={successColor} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDeleteRoom(room)}
            style={[styles.iconButton, { borderColor: errorColor, marginLeft: Layout.spacing.md }]}
          >
            <Ionicons name="trash-outline" size={24} color={errorColor} />
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </Card>
  );

  if (isLoading && !refreshing) {
    return (
      <ThemedView style={[styles.centered, { backgroundColor: containerBackgroundColor }]}> {/* Use ThemedView */}
        <ActivityIndicator size="large" color={tintColor} />
        <ThemedText style={{ color: textColor, marginTop: Layout.spacing.md }}>
          Loading archived rooms...
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Archived Rooms' }} />
      <ThemedView style={[styles.container, { backgroundColor: containerBackgroundColor }]}> {/* Use ThemedView */}
        {archivedRooms.length === 0 ? (
          <ThemedView style={styles.emptyState}> {/* Use ThemedView */}
            <Ionicons name="archive-outline" size={80} color={subtleTextColor} />
            <ThemedText style={[styles.emptyStateTitle, { color: textColor }]}>
              No Archived Rooms
            </ThemedText>
            <ThemedText style={[styles.emptyStateSubtitle, { color: subtleTextColor }]}>
              When you archive rooms from the main list, they'll appear here.
            </ThemedText>
          </ThemedView>
        ) : (
          <FlatList
            data={archivedRooms}
            keyExtractor={(item) => item.id}
            renderItem={renderArchivedRoom}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={tintColor} // Use tintColor for consistency
              />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.lg,
  },
  listContainer: {
    paddingHorizontal: Layout.spacing.md,
    paddingTop: Layout.spacing.md,
    paddingBottom: Layout.spacing.xxl,
  },
  roomItemCard: {
    marginBottom: Layout.spacing.md,
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.lg,
  },
  listItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  roomInfo: {
    flex: 1,
    marginRight: Layout.spacing.sm,
    backgroundColor: 'transparent',
  },
  roomName: {
    fontSize: Layout.fontSize.lg,
    fontFamily: 'Montserrat-SemiBold', 
  },
  roomLocation: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
    marginTop: Layout.spacing.xs,
  },
  archivedDate: {
    fontSize: Layout.fontSize.xs,
    fontFamily: 'Montserrat-Regular',
    marginTop: Layout.spacing.xs,
    fontStyle: 'italic',
  },
  roomActions: {
    flexDirection: 'row', // Changed to row for side-by-side icons
    alignItems: 'center',
    justifyContent: 'flex-end', // Align to the end
    backgroundColor: 'transparent',
  },
  iconButton: { // New style for icon-only buttons
    padding: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.pill, // Make it circular
    borderWidth: 1, // Keep a light border for definition
    // Removed fixed width/height to let padding define size
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.xl,
    backgroundColor: 'transparent',
  },
  emptyStateTitle: {
    fontSize: Layout.fontSize.xl,
    fontFamily: 'Montserrat-Bold',
    marginTop: Layout.spacing.lg,
    marginBottom: Layout.spacing.sm,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    marginBottom: Layout.spacing.xl,
    lineHeight: Layout.fontSize.md * 1.5,
  },
  emptyStateButton: {
    minWidth: 180,
    paddingVertical: Layout.spacing.sm + 2,
  },
});