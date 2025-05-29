// labwatch-app/modules/rooms/components/RoomList.tsx
import Card from '@/components/Card';
import ListItem from '@/components/ListItem';
import { Text as ThemedText } from '@/components/Themed';
import Layout from '@/constants/Layout';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Room } from '@/types/rooms'; // Adjust path as needed
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { RoomService } from '../services/RoomService'; // Adjust path as needed

export default function RoomList() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sectionTitleColor = useThemeColor({ light: '#4A4A4A', dark: '#CCCCCC' }, 'text');
  const errorTextColor = useThemeColor({}, 'errorText');
  const tintColor = useThemeColor({}, 'tint');
  const successListIconColor = useThemeColor({}, 'successText');
  const errorListIconColor = useThemeColor({}, 'errorText');

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = RoomService.onRoomsUpdate(
      (updatedRooms) => {
        setRooms(updatedRooms);
        setIsLoading(false);
        setError(null);
      },
      (fetchError: Error) => {
        console.error("Failed to fetch rooms:", fetchError);
        setError("Failed to load rooms. Please try again.");
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const renderItem = ({ item }: { item: Room }) => (
    <TouchableOpacity onPress={() => router.push(`/(tabs)/rooms/${item.id}` as any)}>
      <Card style={styles.roomItemCard}>
        <ListItem
          title={item.name}
          subtitle={item.location}
          leftIconName={item.isMonitored ? "checkmark-circle-outline" : "close-circle-outline"}
          leftIconColor={item.isMonitored ? successListIconColor : errorListIconColor}
          showBorder={false}
          // Removed direct onPress from ListItem, handled by TouchableOpacity
        />
      </Card>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={tintColor} />
        <ThemedText style={{ marginTop: Layout.spacing.sm, color: sectionTitleColor }}>Loading rooms...</ThemedText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <ThemedText style={{ color: errorTextColor }}>{error}</ThemedText>
      </View>
    );
  }

  return (
    <View style={{flex: 1}}>
      <ThemedText style={[styles.sectionTitle, { color: sectionTitleColor }]}>
        {rooms.length > 0 ? "Monitored Rooms" : "No Rooms Added Yet"}
      </ThemedText>
      {rooms.length === 0 && !isLoading && (
        <View style={styles.centeredMessageContainer}>
            <ThemedText style={{color: sectionTitleColor, fontSize: Layout.fontSize.md, textAlign: 'center', paddingHorizontal: Layout.spacing.lg}}>
                Press the "+" button below to add your first room and start monitoring.
            </ThemedText>
        </View>
      )}
      <FlatList
        data={rooms}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: Layout.spacing.md,
    paddingBottom: Layout.spacing.md,
  },
  roomItemCard: { // Added style for the card wrapping each list item
    marginBottom: Layout.spacing.md,
    // padding: Layout.spacing.md, // ListItem typically handles its own internal padding
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.lg,
  },
  centeredMessageContainer: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.xl,
    paddingHorizontal: Layout.spacing.lg,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.xl,
    fontWeight: Layout.fontWeight.semibold,
    marginVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.md,
  },
});