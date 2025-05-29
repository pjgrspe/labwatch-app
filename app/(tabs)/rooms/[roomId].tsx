// app/(tabs)/rooms/[roomId].tsx
import Card from '@/components/Card';
import { Text as ThemedText, View as ThemedView } from '@/components/Themed'; // Ensure ThemedView is imported
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
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

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
  const successColor = useThemeColor({}, 'successText');
  const cardContentWidth = Layout.window.width - (Layout.spacing.md * 2) - (Layout.spacing.lg * 2);
  const dialGaugeSize = Math.max(110, cardContentWidth / 2 - Layout.spacing.md * 2.5);
  const primaryButtonTextColor = useThemeColor({light: themeColors.cardBackground, dark: themeColors.text}, 'primaryButtonText');


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
          setRoom(null); setSensorData(null); return;
        }
        setRoom(roomData);
      } else {
        currentRoomIsArchived = true; setRoom(null); setSensorData(null);
        Alert.alert("Room Deleted", "This room no longer exists.", [
          { text: "OK", onPress: () => { if (router.canGoBack()) router.back(); else router.replace('/(tabs)/rooms'); } }
        ]);
      }
    }, (error) => console.error(`Error listening to room document ${roomId}:`, error));

    const unsubscribeSensors = RoomService.onRoomSensorsUpdate(roomId, (updatedSensors) => {
      if (!currentRoomIsArchived) setSensorData(updatedSensors);
      else setSensorData(null);
    }, (error) => console.error(`Error listening to sensors for room ${roomId}:`, error));
    return () => { unsubscribeRoom(); unsubscribeSensors(); };
  }, [roomId, router, room?.isArchived]);

  const handleArchiveRoom = () => {
    if (!room) return;
    Alert.alert("Archive Room", `Are you sure you want to archive "${room.name}"?`,
      [{ text: "Cancel", style: "cancel" },
      { text: "Archive", style: "destructive", onPress: async () => {
        if (roomId) {
          setIsArchiving(true);
          try {
            await RoomService.archiveRoom(roomId);
            Alert.alert("Success", `Room "${room.name}" has been archived.`);
            router.back();
          } catch (e: any) { console.error("Failed to archive room:", e); Alert.alert("Error", e.message || "Failed to archive room."); }
          finally { setIsArchiving(false); }
        }
      }}]);
  };
  const handleEditRoom = () => { if (roomId) router.push(`/modals/edit-room?roomId=${roomId}`); };

  const fetchData = useCallback(async (isRefresh: boolean = false) => {
    if (!roomId) {
      Alert.alert("Error", "Room ID is missing.");
      if (!isRefresh) setIsLoading(false); setRefreshing(false);
      if (router.canGoBack()) router.back(); return;
    }
    if (!isRefresh) setIsLoading(true);
    try {
      const roomDetails = await RoomService.getRoomById(roomId);
      if (roomDetails?.isArchived) {
        Alert.alert("Room Archived", "This room has been archived.");
        if(router.canGoBack()) router.back(); else router.replace('/(tabs)/rooms');
        setRoom(null); setSensorData(null);
      } else {
        setRoom(roomDetails);
        const sensors = await RoomService.getSensorsForRoom(roomId);
        setSensorData(sensors);
      }
    } catch (err) { console.error("Failed to fetch room data:", err); Alert.alert("Error", "Failed to load room details."); }
    finally { if (!isRefresh) setIsLoading(false); setRefreshing(false); }
  }, [roomId, router]);

  const onRefresh = useCallback(() => { setRefreshing(true); fetchData(true); }, [fetchData]);
  useEffect(() => { fetchData(false); }, [fetchData]);

  if (isLoading && !refreshing) {
    return (
      <ThemedView style={[styles.centered, { backgroundColor: containerBackgroundColor }]}>
        <ActivityIndicator size="large" color={tintColor} />
        <ThemedText style={{ color: textColor, marginTop: Layout.spacing.md }}>Loading room details...</ThemedText>
      </ThemedView>
    );
  }

  if (!room) {
    return (
      <ThemedView style={[styles.centered, { backgroundColor: containerBackgroundColor }]}>
        <ThemedText style={{ color: errorColor, textAlign: 'center', marginBottom: Layout.spacing.md }}>
          Room not found or has been archived.
        </ThemedText>
         {/* Using a custom TouchableOpacity as AppButton was removed by request */}
        <TouchableOpacity
            style={[styles.customButton, {backgroundColor: tintColor}]}
            onPress={() => router.back()}
            activeOpacity={0.7}
        >
            <ThemedText style={[styles.customButtonText, {color: primaryButtonTextColor}]}>Go Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
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
        contentContainerStyle={styles.scrollContentContainer}
      >
        <ThemedView style={styles.container}> {/* Use ThemedView */}
          <Card style={styles.detailsCard}>
            <ThemedText style={[styles.roomName, { color: textColor }]}>{room.name}</ThemedText>
            <ThemedView style={styles.metaItem}> {/* Use ThemedView */}
              <Ionicons name="location-sharp" size={18} color={subtleTextColor} style={styles.metaIcon} />
              <ThemedText style={[styles.locationText, { color: subtleTextColor }]}>{room.location}</ThemedText>
            </ThemedView>
            <ThemedView style={styles.metaItem}> {/* Use ThemedView */}
              <Ionicons name={room.isMonitored ? "shield-checkmark" : "shield-outline"} size={18} color={room.isMonitored ? successColor : errorColor} style={styles.metaIcon} />
              <ThemedText style={[styles.monitoredText, { color: room.isMonitored ? successColor : errorColor }]}>
                {room.isMonitored ? "Actively Monitored" : "Monitoring Paused"}
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.actionsContainer}>
                <TouchableOpacity
                    style={[styles.customButton, {backgroundColor: tintColor}]}
                    onPress={handleEditRoom}
                    activeOpacity={0.7}
                >
                    <Ionicons name="pencil-outline" size={18} color={primaryButtonTextColor} style={styles.customButtonIcon} />
                    <ThemedText style={[styles.customButtonText, {color: primaryButtonTextColor}]}>Edit</ThemedText>
                </TouchableOpacity>
                 <TouchableOpacity
                    style={[styles.customButton, styles.customButtonOutline, {borderColor: errorColor}]}
                    onPress={handleArchiveRoom}
                    disabled={isArchiving}
                    activeOpacity={0.7}
                >
                  {isArchiving ? (
                    <ActivityIndicator size="small" color={errorColor} />
                  ) : (
                    <>
                      <Ionicons name="archive-outline" size={18} color={errorColor} style={styles.customButtonIcon} />
                      <ThemedText style={[styles.customButtonText, {color: errorColor}]}>Archive</ThemedText>
                    </>
                  )}
                </TouchableOpacity>
            </ThemedView>
          </Card>

          <ThemedText style={[styles.sectionTitle, { color: sectionTitleColor, borderBottomColor: cardBorderColor }]}>
            Live Sensor Data
          </ThemedText>

          {(!sensorData && !isLoading && !refreshing) && (
            <Card><ThemedText style={{color: textColor, textAlign: 'center', padding: Layout.spacing.md, fontFamily: 'Montserrat-Regular'}}>No sensor data currently available.</ThemedText></Card>
          )}
          {(isLoading && !refreshing && !sensorData && room && !room.isArchived) && (
            <ThemedView style={[styles.centered, {minHeight: 200, paddingVertical: Layout.spacing.xl}]}>
                <ActivityIndicator size="large" color={tintColor} />
                <ThemedText style={{ color: textColor, marginTop: Layout.spacing.md, fontFamily: 'Montserrat-Regular' }}>Loading sensor data...</ThemedText>
            </ThemedView>
           )}

          {(tempHumidity || airQuality) && (
            <Card>
              <ThemedText style={[styles.subSectionTitle, { color: sectionTitleColor }]}>
                Environmental
              </ThemedText>
              <ThemedView style={styles.gaugesGrid}> {/* Use ThemedView */}
                {tempHumidity && (
                  <DialGauge 
                    value={tempHumidity.temperature} 
                    label="Temperature" 
                    sensorType="tempHumidity"
                    dataType="temperature"
                    useAlertBasedRange={true}
                    size={dialGaugeSize} 
                    statusColor={getStatusColorForDial(tempHumidity.status, currentTheme)} 
                    coldColor={themeColors.accentLight} 
                    hotColor={themeColors.errorText} 
                  />
                )}
                {tempHumidity && (
                  <DialGauge 
                    value={tempHumidity.humidity} 
                    label="Humidity" 
                    sensorType="tempHumidity"
                    dataType="humidity"
                    useAlertBasedRange={true}
                    size={dialGaugeSize} 
                    statusColor={getStatusColorForDial(tempHumidity.status, currentTheme)} 
                    coldColor={themeColors.accent} 
                    hotColor={themeColors.infoText} 
                  />
                )}
              </ThemedView>
              <ThemedView style={[styles.gaugesGrid, {marginTop: (tempHumidity && airQuality) ? Layout.spacing.md : 0}]}> {/* Use ThemedView */}
                {airQuality && (
                  <DialGauge 
                    value={airQuality.pm25} 
                    label="PM2.5" 
                    sensorType="airQuality"
                    dataType="pm25"
                    useAlertBasedRange={true}
                    size={dialGaugeSize} 
                    statusColor={getStatusColorForDial(airQuality.aqiLevel || airQuality.status, currentTheme)} 
                    coldColor={themeColors.successText} 
                    hotColor={themeColors.warningText} 
                  />
                )}
                {airQuality && (
                  <DialGauge 
                    value={airQuality.pm10} 
                    label="PM10" 
                    sensorType="airQuality"
                    dataType="pm10"
                    useAlertBasedRange={true}
                    size={dialGaugeSize} 
                    statusColor={getStatusColorForDial(airQuality.aqiLevel || airQuality.status, currentTheme)} 
                    coldColor={themeColors.successText} 
                    hotColor={themeColors.warningText} 
                  />
                )}
              </ThemedView>
              {(!tempHumidity && !airQuality && sensorData) && <ThemedText style={[styles.noDataTextSmall, {color: subtleTextColor}]}>No environmental data.</ThemedText>}
            </Card>
          )}

          {thermalData && (
            <Card>
              <ThemedText style={[styles.subSectionTitle, { color: sectionTitleColor }]}>
                {thermalData.name || "Thermal Scan"}
              </ThemedText>
              <HeatmapGrid data={thermalData.pixels} minTempThreshold={15} maxTempThreshold={45} />
              <ThemedView style={styles.thermalStatsContainer}> {/* Use ThemedView */}
                <DialGauge 
                  value={thermalData.avgTemp} 
                  label="Avg Temp" 
                  sensorType="thermalImager"
                  dataType="avgTemp"
                  useAlertBasedRange={true}
                  size={Math.min(dialGaugeSize, 100)} 
                  statusColor={getStatusColorForDial('normal', currentTheme)} 
                  coldColor={themeColors.accentLight} 
                  hotColor={themeColors.errorText} 
                />
                <DialGauge 
                  value={thermalData.maxTemp} 
                  label="Max Temp" 
                  sensorType="thermalImager"
                  dataType="maxTemp"
                  useAlertBasedRange={true}
                  size={Math.min(dialGaugeSize, 100)} 
                  statusColor={getStatusColorForDial('normal', currentTheme)} 
                  coldColor={themeColors.accentLight} 
                  hotColor={themeColors.errorText} 
                />
              </ThemedView>
              <ThemedView style={styles.thermalTextStatsContainer}>
                 <ThemedText style={[styles.thermalStatText, { color: textColor }]}>Min: {thermalData.minTemp.toFixed(1)}°C</ThemedText>
                 <ThemedText style={[styles.thermalStatText, { color: textColor }]}>Avg: {thermalData.avgTemp.toFixed(1)}°C</ThemedText>
                 <ThemedText style={[styles.thermalStatText, { color: textColor }]}>Max: {thermalData.maxTemp.toFixed(1)}°C</ThemedText>
              </ThemedView>
            </Card>
          )}
          {vibrationData && (
            <Card>
              <ThemedText style={[styles.subSectionTitle, { color: sectionTitleColor }]}>
                Vibration Sensor
              </ThemedText>
              <ThemedView style={styles.vibrationContainer}>
                <DialGauge 
                  value={vibrationData.rmsAcceleration} 
                  label="RMS Acceleration" 
                  sensorType="vibration"
                  dataType="rmsAcceleration"
                  useAlertBasedRange={true}
                  size={dialGaugeSize} 
                  statusColor={getStatusColorForDial(vibrationData.status || 'normal', currentTheme)} 
                  coldColor={themeColors.successText} 
                  hotColor={themeColors.errorText} 
                />
                <ThemedText style={[styles.vibrationLabel, { color: textColor }]}>
                  {`${vibrationData.name || 'Vibration Sensor'} - ${vibrationData.status || 'Unknown'}`}
                </ThemedText>
              </ThemedView>
            </Card>
          )}
        </ThemedView>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  scrollViewContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    paddingBottom: Layout.spacing.xl,
  },
  container: {
    flex: 1,
    padding: Layout.spacing.md,
    backgroundColor: 'transparent', 
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.lg,
    backgroundColor: 'transparent',
  },
  detailsCard: {
    marginBottom: Layout.spacing.lg,
    padding: Layout.spacing.lg, 
  },
  roomName: {
    fontSize: Layout.fontSize.xxl,
    fontFamily: 'Montserrat-Bold',
    marginBottom: Layout.spacing.md, 
    textAlign: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  metaIcon: {
    marginRight: Layout.spacing.sm,
  },
  locationText: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Medium',
  },
  monitoredText: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Medium',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around', 
    marginTop: Layout.spacing.lg,
    gap: Layout.spacing.md, 
    backgroundColor: 'transparent',
  },
  customButton: { // New style for custom TouchableOpacity buttons
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.sm + 2, // Adjusted padding
    paddingHorizontal: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    minHeight: 44, // Ensure good tap target size
  },
  customButtonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  customButtonText: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-SemiBold',
  },
  customButtonIcon: {
    marginRight: Layout.spacing.xs,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.xl,
    fontFamily: 'Montserrat-Bold', 
    marginTop: Layout.spacing.lg,
    marginBottom: Layout.spacing.md,
    paddingBottom: Layout.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth, 
  },
  subSectionTitle: {
    fontSize: Layout.fontSize.lg,
    fontFamily: 'Montserrat-SemiBold', 
    marginBottom: Layout.spacing.md,
    textAlign: 'center',
  },
  gaugesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start', 
    flexWrap: 'wrap',
    backgroundColor: 'transparent',
    marginVertical: Layout.spacing.xs, 
  },
  thermalStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: Layout.spacing.md,
    paddingTop: Layout.spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    backgroundColor: 'transparent',
  },
  thermalTextStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Layout.spacing.md,
    paddingTop: Layout.spacing.sm,
    backgroundColor: 'transparent',
  },
  thermalStatText: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Medium',
  },
  vibrationContainer: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.lg,
    backgroundColor: 'transparent',
  },
  vibrationLabel: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Medium',
    textAlign: 'center',
  },
  noDataTextSmall: {
    textAlign: 'center',
    fontStyle: 'italic',
    padding: Layout.spacing.md,
    fontFamily: 'Montserrat-Regular',
  },
});