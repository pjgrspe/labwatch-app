// labwatch-app/app/(tabs)/rooms/archived.tsx
import Card from '@/components/Card';
import { Text as ThemedText, View as ThemedView } from '@/components/Themed';
import Layout from '@/constants/Layout';
import { useThemeColor } from '@/hooks/useThemeColor';
import { RoomService } from '@/modules/rooms/services/RoomService';
import { Room } from '@/types/rooms';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function ArchivedRoomsScreen() {
  const router = useRouter();
  const [archivedRooms, setArchivedRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null); // For restore/delete operations

  const containerBackgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtleTextColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');
  const successColor = useThemeColor({}, 'successText');
  const errorColor = useThemeColor({}, 'errorText');


  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = RoomService.onArchivedRoomsUpdate(
      (updatedRooms) => {
        setArchivedRooms(updatedRooms);
        setIsLoading(false);
      },
      (error) => {
        console.error("Failed to fetch archived rooms:", error);
        Alert.alert("Error", "Could not load archived rooms.");
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleRestoreRoom = (roomId: string, roomName: string) => {
    Alert.alert(
      "Restore Room",
      `Are you sure you want to restore "${roomName}"? It will reappear in the main list.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Restore",
          onPress: async () => {
            setIsProcessing(roomId);
            try {
              await RoomService.restoreRoom(roomId);
              Alert.alert("Success", `Room "${roomName}" has been restored.`);
              // The list will update via the onArchivedRoomsUpdate listener
            } catch (error) {
              console.error("Failed to restore room:", error);
              Alert.alert("Error", "Failed to restore room.");
            } finally {
              setIsProcessing(null);
            }
          },
        },
      ]
    );
  };

  const handlePermanentlyDeleteRoom = (roomId: string, roomName: string) => {
    Alert.alert(
      "Permanently Delete Room",
      `Are you sure you want to PERMANENTLY delete "${roomName}"? This action cannot be undone and will delete all associated sensor data.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Permanently",
          style: "destructive",
          onPress: async () => {
            setIsProcessing(roomId);
            try {
              await RoomService.permanentlyDeleteRoom(roomId);
              Alert.alert("Success", `Room "${roomName}" has been permanently deleted.`);
               // The list will update via the onArchivedRoomsUpdate listener
            } catch (error) {
              console.error("Failed to permanently delete room:", error);
              Alert.alert("Error", "Failed to permanently delete room.");
            } finally {
              setIsProcessing(null);
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: Room }) => (
    <Card style={styles.roomItemCard}>
      <View style={styles.roomInfoContainer}>
        <ThemedText style={[styles.roomName, { color: textColor }]}>{item.name}</ThemedText>
        <ThemedText style={[styles.roomLocation, { color: subtleTextColor }]}>{item.location}</ThemedText>
        {item.archivedAt && (
          <ThemedText style={[styles.archivedDate, { color: subtleTextColor }]}>
            Archived on: {new Date(item.archivedAt).toLocaleDateString()}
          </ThemedText>
        )}
      </View>
      {isProcessing === item.id ? (
        <ActivityIndicator color={tintColor} style={styles.actionsContainer} />
      ) : (
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: successColor }]}
            onPress={() => handleRestoreRoom(item.id, item.name)}
          >
            <Ionicons name="refresh-outline" size={20} color="#fff" />
            <ThemedText style={styles.actionButtonText}>Restore</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: errorColor, marginLeft: Layout.spacing.sm }]}
            onPress={() => handlePermanentlyDeleteRoom(item.id, item.name)}
          >
            <Ionicons name="trash-bin-outline" size={20} color="#fff" />
            <ThemedText style={styles.actionButtonText}>Delete</ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: containerBackgroundColor }]}>
        <ActivityIndicator size="large" color={tintColor} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Archived Rooms' }} />
      <ThemedView style={[styles.container, { backgroundColor: containerBackgroundColor }]}>
        {archivedRooms.length === 0 ? (
          <View style={styles.centered}>
            <Ionicons name="archive-outline" size={60} color={subtleTextColor} />
            <ThemedText style={[styles.emptyText, { color: textColor }]}>No archived rooms.</ThemedText>
          </View>
        ) : (
          <FlatList
            data={archivedRooms}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
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
  emptyText: {
    marginTop: Layout.spacing.md,
    fontSize: Layout.fontSize.lg,
    textAlign: 'center',
  },
  listContent: {
    padding: Layout.spacing.md,
  },
  roomItemCard: {
    marginBottom: Layout.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomInfoContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  roomName: {
    fontSize: Layout.fontSize.lg,
    fontWeight: Layout.fontWeight.semibold,
  },
  roomLocation: {
    fontSize: Layout.fontSize.sm,
    marginTop: Layout.spacing.xs,
  },
  archivedDate: {
    fontSize: Layout.fontSize.xs,
    fontStyle: 'italic',
    marginTop: Layout.spacing.xs,
  },
  actionsContainer: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.md,
    borderRadius: Layout.borderRadius.sm,
  },
  actionButtonText: {
    color: '#fff',
    marginLeft: Layout.spacing.xs,
    fontSize: Layout.fontSize.sm,
    fontWeight: Layout.fontWeight.medium,
  },
});