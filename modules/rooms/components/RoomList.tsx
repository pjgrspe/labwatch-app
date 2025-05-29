// labwatch-app/modules/rooms/components/RoomList.tsx
import Card from '@/components/Card';
import { Text as ThemedText } from '@/components/Themed';
import Layout from '@/constants/Layout';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Room } from '@/types/rooms'; // Adjust path as needed
import { Ionicons } from '@expo/vector-icons';
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
  const subtleTextColor = useThemeColor({}, 'icon'); // For less prominent text like subtitles or status tags
  const cardBackgroundColor = useThemeColor({}, 'cardBackground');
  const monitoredColor = useThemeColor({}, 'successText'); // Green for monitored
  const notMonitoredColor = useThemeColor({}, 'icon'); // Grey for not monitored, or a subtle warning
  const emptyStateIconColor = useThemeColor({}, 'icon');


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
      <Card style={[styles.roomItemCard, {backgroundColor: cardBackgroundColor}]}>
        {/* Modified ListItem content */}
        <View style={styles.listItemContent}>
          <View style={styles.roomInfo}>
            <ThemedText style={[styles.roomName, { color: sectionTitleColor }]}>{item.name}</ThemedText>
            <ThemedText style={[styles.roomLocation, { color: subtleTextColor }]}>{item.location}</ThemedText>
          </View>
          <View style={styles.statusIndicatorContainer}>
            <View style={[
              styles.statusDot,
              { backgroundColor: item.isMonitored ? monitoredColor : notMonitoredColor }
            ]} />
            <ThemedText style={[
              styles.statusText,
              { color: item.isMonitored ? monitoredColor : notMonitoredColor }
            ]}>
              {item.isMonitored ? "Monitored" : "Not Monitored"}
            </ThemedText>
          </View>
        </View>
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
        {/* This title can be removed if the header in app/(tabs)/rooms/index.tsx is sufficient */}
        {/* Or, adapt its visibility based on whether rooms exist */}
        {rooms.length > 0 ? "All Rooms" : ""}
      </ThemedText>
      {rooms.length === 0 && !isLoading && (
        <View style={styles.emptyStateContainer}>
            <Ionicons name="cube-outline" size={80} color={emptyStateIconColor} />
            <ThemedText style={[styles.emptyStateTitle, {color: sectionTitleColor}]}>No Rooms Yet</ThemedText>
            <ThemedText style={[styles.emptyStateSubtitle, {color: subtleTextColor}]}>
                Press the "+" button below to add your first lab room and start monitoring.
            </ThemedText>
        </View>
      )}
      <FlatList
        data={rooms}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: Layout.spacing.md,
    paddingBottom: Layout.spacing.xxl + Layout.spacing.lg, // Increased padding for FAB
  },
  roomItemCard: {
    marginBottom: Layout.spacing.md,
    paddingVertical: Layout.spacing.md, // Adjusted padding
    paddingHorizontal: Layout.spacing.lg, // Adjusted padding
  },
  listItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent', // Ensure card background shows
  },
  roomInfo: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  roomName: {
    fontSize: Layout.fontSize.lg, // Slightly larger
    fontWeight: Layout.fontWeight.semibold, // More emphasis
  },
  roomLocation: {
    fontSize: Layout.fontSize.sm,
    marginTop: Layout.spacing.xs,
  },
  statusIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingLeft: Layout.spacing.md, // Space from room info
  },
  statusDot: {
    width: 10, // Larger dot
    height: 10,
    borderRadius: 5,
    marginRight: Layout.spacing.sm,
  },
  statusText: {
    fontSize: Layout.fontSize.xs,
    fontWeight: Layout.fontWeight.medium,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.lg,
  },
  emptyStateContainer: { // Enhanced empty state
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.xl,
    paddingBottom: Layout.spacing.xxl, // Space for FAB
  },
  emptyStateTitle: {
      fontSize: Layout.fontSize.xl,
      fontWeight: Layout.fontWeight.bold,
      marginTop: Layout.spacing.lg,
      marginBottom: Layout.spacing.sm,
  },
  emptyStateSubtitle: {
      fontSize: Layout.fontSize.md,
      textAlign: 'center',
      lineHeight: Layout.fontSize.md * 1.5,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.xl, // Keep it if you want a title within this component
    fontWeight: Layout.fontWeight.semibold,
    marginVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.md,
  },
});