// app/(tabs)/rooms/[roomId].tsx
import Card from '@/components/Card';
import { Text as ThemedText, View as ThemedView } from '@/components/Themed';
import DialGauge from '@/components/ui/DialGauge';
import HeatmapGrid from '@/components/ui/HeatmapGrid';
import { Colors } from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { db } from '@/FirebaseConfig';
import { useCurrentTheme, useThemeColor } from '@/hooks/useThemeColor';
import { getStatusColorForDial } from '@/modules/dashboard/utils/colorHelpers';
import { RoomService, ROOMS_COLLECTION as roomsCollectionName } from '@/modules/rooms/services/RoomService';
import { Room, RoomSensorData } from '@/types/rooms';
import { AirQualityData, TempHumidityData, ThermalImagerData, VibrationData } from '@/types/sensor';
import { convertTimestamps } from '@/utils/firebaseUtils';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { doc, onSnapshot } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function RoomDetailScreen() {
  const router = useRouter();
  const { roomId } = useLocalSearchParams<{ roomId: string }>();

  const [room, setRoom] = useState<Room | null>(null);
  const [sensorData, setSensorData] = useState<RoomSensorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isArchiving, setIsArchiving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const currentTheme = useCurrentTheme();
  const themeColors = Colors[currentTheme];
  const containerBackgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtleTextColor = useThemeColor({}, 'icon');
  const sectionTitleColor = useThemeColor({}, 'text');
  const cardBorderColor = useThemeColor({}, 'borderColor');
  const tintColor = useThemeColor({}, 'tint');
  const errorColor = useThemeColor({}, 'errorText');
  const cardContentWidth = Layout.window.width - (Layout.spacing.md * 2) - (Layout.spacing.lg * 2);
  const dialGaugeSize = Math.max(120, cardContentWidth / 2 - (Layout.spacing.md * 2));

  const fetchData = useCallback(async (isRefresh: boolean = false) => {
    if (!roomId) {
      Alert.alert("Error", "Room ID is missing.");
      if (!isRefresh) setIsLoading(false);
      setRefreshing(false);
      if (router.canGoBack()) router.back();
      return;
    }
    if (!isRefresh) setIsLoading(true);

    try {
      const roomDetails = await RoomService.getRoomById(roomId);
      if (roomDetails?.isArchived) {
        Alert.alert("Room Archived", "This room has been archived and cannot be viewed directly.");
        if(router.canGoBack()) router.back(); else router.replace('/(tabs)/rooms');
        setRoom(null); // Clear room state
        setSensorData(null); // Clear sensor state
        if (!isRefresh) setIsLoading(false);
        setRefreshing(false);
        return;
      }
      // Set room state here if not archived, or rely on the listener to set it.
      // For initial load, it's good to set it.
      setRoom(roomDetails);

      // Fetch initial sensor data if not relying solely on the listener for the first load
      const sensors = await RoomService.getSensorsForRoom(roomId);
      setSensorData(sensors);

    } catch (err) {
      console.error("Failed to fetch room data:", err);
      Alert.alert("Error", "Failed to load room details.");
    } finally {
      if (!isRefresh) setIsLoading(false);
      setRefreshing(false);
    }
  }, [roomId, router]);

  // Effect for initial data load
  useEffect(() => {
    fetchData(false);
  }, [fetchData]); // fetchData is memoized with useCallback

  // Effect for setting up listeners
  useEffect(() => {
    if (!roomId) return;

    let currentRoomIsArchived = room?.isArchived ?? false;

    const roomDocRef = doc(db, roomsCollectionName, roomId);
    const unsubscribeRoom = onSnapshot(roomDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const roomData = convertTimestamps({ id: docSnapshot.id, ...docSnapshot.data() }) as Room;
        currentRoomIsArchived = roomData.isArchived ?? false;
        if (roomData.isArchived) {
          Alert.alert("Room Archived", "This room has been archived.", [
            { text: "OK", onPress: () => { if (router.canGoBack()) router.back(); else router.replace('/(tabs)/rooms/archived'); } }
          ]);
          setRoom(null);
          setSensorData(null);
          return;
        }
        setRoom(roomData);
      } else {
        currentRoomIsArchived = true; // Consider it gone/archived
        setRoom(null);
        setSensorData(null);
        Alert.alert("Room Deleted", "This room no longer exists.", [
          { text: "OK", onPress: () => { if (router.canGoBack()) router.back(); else router.replace('/(tabs)/rooms'); } }
        ]);
      }
    }, (error) => {
      console.error(`Error listening to room document ${roomId}:`, error);
      // Potentially navigate back or show an error
    });

    const unsubscribeSensors = RoomService.onRoomSensorsUpdate(roomId, (updatedSensors) => {
      if (!currentRoomIsArchived) {
        setSensorData(updatedSensors);
      } else {
         // Ensure sensor data is cleared if room becomes archived
        setSensorData(null);
      }
    }, (error) => { // Added error handling for sensor updates
        console.error(`Error listening to sensors for room ${roomId}:`, error);
        // Potentially set sensorData to null or show an error indicator
    });

    return () => {
      unsubscribeRoom();
      unsubscribeSensors();
    };
  }, [roomId, router, room?.isArchived]); // Added room?.isArchived to re-evaluate if local `currentRoomIsArchived` should be updated based on initial room state from fetchData


  const handleEditRoom = () => {
    if (roomId) {
      router.push(`/modals/edit-room?roomId=${roomId}`);
    }
  };

  const handleArchiveRoom = () => {
    if (!room) return;
    Alert.alert(
      "Archive Room",
      `Are you sure you want to archive "${room.name}"? The room will be hidden from the main list and its monitoring will be paused. You can restore it later.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Archive",
          style: "destructive",
          onPress: async () => {
            if (roomId) {
              setIsArchiving(true);
              try {
                await RoomService.archiveRoom(roomId);
                Alert.alert("Success", `Room "${room.name}" archived.`);
                router.back();
              } catch (e) {
                console.error("Failed to archive room:", e);
                Alert.alert("Error", "Failed to archive room.");
              } finally {
                setIsArchiving(false);
              }
            }
          },
        },
      ]
    );
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(true); // Pass true to indicate it's a refresh
  }, [fetchData]);


  if (isLoading && !refreshing) {
    return (
      <View style={[styles.centered, { backgroundColor: containerBackgroundColor }]}>
        <ActivityIndicator size="large" color={tintColor} />
        <ThemedText style={{ color: textColor, marginTop: 10 }}>Loading room details...</ThemedText>
      </View>
    );
  }

  if (!room) {
    // This condition is met if the room is not found, or has been archived and navigated away.
    // The loading indicator might briefly show before navigation, or this UI if navigation fails.
    return (
      <View style={[styles.centered, { backgroundColor: containerBackgroundColor }]}>
        <ThemedText style={{ color: errorColor }}>Room not found or has been archived.</ThemedText>
        <Button title="Go Back" onPress={() => router.back()} color={tintColor} />
      </View>
    );
  }


  const tempHumidity = sensorData?.tempHumidity as TempHumidityData | undefined;
  const airQuality = sensorData?.airQuality as AirQualityData | undefined;
  const thermalData = sensorData?.thermalImager as ThermalImagerData | undefined;
  const vibrationData = sensorData?.vibration as VibrationData | undefined;

  return (
    <>
      <Stack.Screen options={{ title: room?.name || 'Room Details' }} />
      <ScrollView
        style={[styles.scrollViewContainer, { backgroundColor: containerBackgroundColor }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={tintColor} />}
      >
        <View style={styles.container}>
          <Card style={styles.detailsCard}>
            <ThemedText style={[styles.roomName, { color: textColor }]}>{room.name}</ThemedText>
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={18} color={subtleTextColor} />
              <ThemedText style={[styles.locationText, { color: subtleTextColor }]}>{room.location}</ThemedText>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name={room.isMonitored ? "checkmark-circle-outline" : "close-circle-outline"} size={18} color={room.isMonitored ? themeColors.successText : errorColor} />
              <ThemedText style={[styles.monitoredText, { color: room.isMonitored ? themeColors.successText : errorColor }]}>
                {room.isMonitored ? "Actively Monitored" : "Not Monitored"}
              </ThemedText>
            </View>
            <View style={styles.actionsContainer}>
              <TouchableOpacity onPress={handleEditRoom} style={[styles.actionButton, { backgroundColor: tintColor }]}>
                <Ionicons name="pencil-outline" size={20} color="white" />
                <ThemedText style={[styles.actionButtonText, {color: "white"}]}>Edit</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleArchiveRoom} style={[styles.actionButton, { backgroundColor: errorColor }]}>
                 {isArchiving ? (
                    <ActivityIndicator size="small" color="white" />
                 ) : (
                    <>
                        <Ionicons name="archive-outline" size={20} color="white" />
                        <ThemedText style={[styles.actionButtonText, {color: "white"}]}>Archive</ThemedText>
                    </>
                 )}
              </TouchableOpacity>
            </View>
          </Card>

          <ThemedText style={[styles.sectionTitle, { color: sectionTitleColor, borderBottomColor: cardBorderColor }]}>Sensor Data</ThemedText>
          {!sensorData && !isLoading && !refreshing && (
            <Card><ThemedText style={{color: textColor, textAlign: 'center', padding: Layout.spacing.md}}>No sensor data available for this room.</ThemedText></Card>
          )}
           {(isLoading && !refreshing && !sensorData && room && !room.isArchived) && ( // Show loading only if room is supposed to be active
            <View style={[styles.centered, {minHeight: 200}]}>
                <ActivityIndicator size="large" color={tintColor} />
                <ThemedText style={{ color: textColor, marginTop: 10 }}>Loading sensor data...</ThemedText>
            </View>
           )}


           {(tempHumidity || airQuality) && (
            <Card>
              <ThemedText style={[styles.subSectionTitle, { color: sectionTitleColor }]}>
                Environmental Conditions
              </ThemedText>
              <View style={styles.gaugesGrid}>
                {tempHumidity ? (
                  <View style={styles.gaugePairContainer}>
                    <DialGauge value={tempHumidity.temperature} label="Temperature" unit="°C" size={dialGaugeSize} statusColor={getStatusColorForDial(tempHumidity.status, currentTheme)} coldColor="#3B82F6" hotColor="#EF4444" dangerLevel={tempHumidity.status === 'warning' ? (tempHumidity.temperature > 0 ? 30 : -10) : undefined} />
                    <DialGauge value={tempHumidity.humidity} label="Humidity" unit="%" size={dialGaugeSize} statusColor={getStatusColorForDial(tempHumidity.status, currentTheme)} coldColor="#3B82F6" hotColor="#A855F7" dangerLevel={tempHumidity.status === 'warning' ? 60 : undefined} />
                  </View>
                ) : (
                  <View style={styles.noDataGaugePlaceholderSingle}><ThemedText style={[styles.noDataTextSmall, { color: sectionTitleColor }]}>No Temp/Humidity data.</ThemedText></View>
                )}
                {airQuality ? (
                  <View style={styles.gaugePairContainer}>
                    <DialGauge value={airQuality.pm25} label="PM2.5" unit="µg/m³" max={150} size={dialGaugeSize} statusColor={getStatusColorForDial(airQuality.aqiLevel || airQuality.status, currentTheme)} coldColor="#4ADE80" hotColor="#F59E0B" dangerLevel={airQuality.aqiLevel === 'unhealthy_sensitive' ? 35.5 : (airQuality.aqiLevel === 'unhealthy' ? 55.5 : undefined)} />
                    <DialGauge value={airQuality.pm10} label="PM10" unit="µg/m³" max={250} size={dialGaugeSize} statusColor={getStatusColorForDial(airQuality.aqiLevel || airQuality.status, currentTheme)} coldColor="#4ADE80" hotColor="#F59E0B" dangerLevel={airQuality.aqiLevel === 'unhealthy_sensitive' ? 155 : (airQuality.aqiLevel === 'unhealthy' ? 255 : undefined)} />
                  </View>
                ) : (
                   <View style={styles.noDataGaugePlaceholderSingle}><ThemedText style={[styles.noDataTextSmall, { color: sectionTitleColor }]}>No Air Quality data.</ThemedText></View>
                )}
              </View>
            </Card>
          )}

          {thermalData && (
            <Card>
              <ThemedText style={[styles.subSectionTitle, { color: sectionTitleColor, borderTopColor: cardBorderColor, borderTopWidth: StyleSheet.hairlineWidth, paddingTop: Layout.spacing.md }]}>
                {thermalData.name}
              </ThemedText>
              <HeatmapGrid data={thermalData.pixels} minTempThreshold={15} maxTempThreshold={45} />
              <ThemedView style={styles.thermalStatsContainer}>
                 <ThemedText style={[styles.thermalStatText, { color: sectionTitleColor }]}>Min: {thermalData.minTemp.toFixed(1)}°C</ThemedText>
                 <ThemedText style={[styles.thermalStatText, { color: sectionTitleColor }]}>Avg: {thermalData.avgTemp.toFixed(1)}°C</ThemedText>
                 <ThemedText style={[styles.thermalStatText, { color: sectionTitleColor }]}>Max: {thermalData.maxTemp.toFixed(1)}°C</ThemedText>
              </ThemedView>
            </Card>
          )}
            {vibrationData && (
                <Card>
                    <ThemedText style={[styles.subSectionTitle, { color: sectionTitleColor, borderTopColor: cardBorderColor, borderTopWidth: StyleSheet.hairlineWidth, paddingTop: Layout.spacing.md }]}>
                        Vibration Status
                    </ThemedText>
                    <View style={styles.vibrationContainer}>
                        <Ionicons name="pulse-outline" size={dialGaugeSize / 3} color={getStatusColorForDial(vibrationData.status, currentTheme)} />
                        <ThemedText style={[styles.vibrationValue, {color: getStatusColorForDial(vibrationData.status, currentTheme), fontSize: dialGaugeSize / 3.5}]}>{vibrationData.rmsAcceleration.toFixed(2)} g</ThemedText>
                        <ThemedText style={[styles.vibrationLabel, {color: textColor}]}>{vibrationData.name} - {vibrationData.status}</ThemedText>
                    </View>
                </Card>
            )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scrollViewContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: Layout.spacing.md,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsCard: {
    marginBottom: Layout.spacing.lg,
  },
  roomName: {
    fontSize: Layout.fontSize.xxl,
    fontWeight: Layout.fontWeight.bold,
    marginBottom: Layout.spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.xs,
    backgroundColor: 'transparent',
  },
  locationText: {
    fontSize: Layout.fontSize.md,
    marginLeft: Layout.spacing.sm,
  },
  monitoredText: {
    fontSize: Layout.fontSize.md,
    marginLeft: Layout.spacing.sm,
    fontStyle: 'italic',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Layout.spacing.lg,
    backgroundColor: 'transparent',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.md,
    minWidth: 120,
    justifyContent: 'center',
  },
  actionButtonText: {
    marginLeft: Layout.spacing.sm,
    fontSize: Layout.fontSize.md,
    fontWeight: Layout.fontWeight.medium,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.xl,
    fontWeight: Layout.fontWeight.semibold,
    marginTop: Layout.spacing.lg,
    marginBottom: Layout.spacing.md,
    paddingBottom: Layout.spacing.xs,
    borderBottomWidth: 1,
  },
  subSectionTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: Layout.fontWeight.semibold,
    marginBottom: Layout.spacing.sm,
  },
  gaugesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
  },
  gaugePairContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: Layout.spacing.xs,
  },
  noDataGaugePlaceholderSingle: {
    flex: 1,
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.sm,
  },
  thermalStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Layout.spacing.md,
    backgroundColor: 'transparent',
    paddingVertical: Layout.spacing.sm,
  },
  thermalStatText: {
    fontSize: Layout.fontSize.sm,
    fontWeight: Layout.fontWeight.medium,
  },
  noDataTextSmall: {
    textAlign: 'center',
    fontSize: Layout.fontSize.sm,
    paddingVertical: Layout.spacing.sm,
    fontStyle: 'italic',
  },
   vibrationContainer: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.lg,
  },
  vibrationValue: {
    fontWeight: Layout.fontWeight.bold,
    marginTop: Layout.spacing.xs,
    marginBottom: Layout.spacing.xs,
  },
  vibrationLabel: {
    fontSize: Layout.fontSize.md,
  },
});