// app/(tabs)/rooms/[roomId].tsx
import { Card, ThemedText, ThemedView } from '@/components';
import DialGauge from '@/components/ui/DialGauge';
import HeatmapGrid from '@/components/ui/HeatmapGrid';
import { Colors, Layout } from '@/constants';
import { app, db } from '@/FirebaseConfig'; // Import app for RTDB
import { useCurrentTheme, useThemeColor } from '@/hooks';
import { CameraSection } from '@/modules/cameras/components';
import { useCameras } from '@/modules/cameras/hooks';
import { getStatusColorForDial } from '@/modules/dashboard/utils/colorHelpers';
import { RoomService, ROOMS_COLLECTION as roomsCollectionName } from '@/modules/rooms/services/RoomService';
import { Room, RoomSensorData } from '@/types/rooms';
import { AirQualityData, TempHumidityData, ThermalImagerData, VibrationData } from '@/types/sensor';
import { convertTimestamps } from '@/utils/firebaseUtils';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { doc, onSnapshot } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

// Import Realtime Database functions
import { Database, getDatabase, off, onValue, ref as rtdbRef } from "firebase/database";

// Helper to convert flat pixel array (64 elements) to Record<string, number[]> (8x8 grid)
const flatPixelsToGrid = (flatPixels: number[] | undefined): Record<string, number[]> => {
  const grid: Record<string, number[]> = {};
  if (!flatPixels || flatPixels.length !== 64) {
    for (let i = 0; i < 8; i++) {
      grid[String(i)] = Array(8).fill(0); // Default to 0 or some placeholder
    }
    return grid;
  }
  for (let i = 0; i < 8; i++) {
    grid[String(i)] = flatPixels.slice(i * 8, (i + 1) * 8);
  }
  return grid;
};


export default function RoomDetailScreen() {
  const router = useRouter();
  const { roomId } = useLocalSearchParams<{ roomId: string }>();

  const [room, setRoom] = useState<Room | null>(null);
  const [sensorData, setSensorData] = useState<RoomSensorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isArchiving, setIsArchiving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoadingSensors, setIsLoadingSensors] = useState(false);
  const [testingCameraId, setTestingCameraId] = useState<string | undefined>(undefined);

  // Camera integration
  const { cameras, isLoading: isLoadingCameras, testConnection } = useCameras(roomId || undefined); 

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
  const warningColor = useThemeColor({}, 'warningText');
  const cardContentWidth = Layout.window.width - (Layout.spacing.md * 2) - (Layout.spacing.lg * 2);
  const dialGaugeSize = Math.max(110, cardContentWidth / 2 - Layout.spacing.md * 2.5);
  const primaryButtonTextColor = useThemeColor({light: themeColors.cardBackground, dark: themeColors.text}, 'primaryButtonText');

  // Fetch initial room details from Firestore (no longer fetches sensors here)
  const fetchRoomDetails = useCallback(async (isRefresh: boolean = false) => {
    if (!roomId) {
      Alert.alert("Error", "Room ID is missing.");
      if (!isRefresh) setIsLoading(false); setRefreshing(false);
      if (router.canGoBack()) router.back(); return;
    }
    if (!isRefresh) setIsLoading(true);
    try {
      const roomDetails = await RoomService.getRoomById(roomId);
      if (roomDetails?.isArchived) {
        Alert.alert("Room Archived", "This room has been archived and its data may not be live.", [
          { text: "OK", onPress: () => { if (router.canGoBack()) router.back(); else router.replace('/(tabs)/rooms/archived'); } }
        ]);
        setRoom(null); // Clear room data if archived before setting it
        setSensorData(null);
      } else {
        setRoom(roomDetails); 
      }
    } catch (err) { console.error("Failed to fetch room details:", err); Alert.alert("Error", "Failed to load room details."); }
    finally { if (!isRefresh) setIsLoading(false); setRefreshing(false); }
  }, [roomId, router]);

  useEffect(() => {
    fetchRoomDetails(false);
  }, [fetchRoomDetails]);


  // Firestore listener for room document changes (e.g., archiving, name changes)
  useEffect(() => {
    if (!roomId) return;
    const roomDocRef = doc(db, roomsCollectionName, roomId);
    const unsubscribeRoomFirestore = onSnapshot(roomDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const roomData = convertTimestamps({ id: docSnapshot.id, ...docSnapshot.data() }) as Room;
        if (roomData.isArchived) {
          if (room && !room.isArchived) { 
            Alert.alert("Room Archived", "This room has been archived.", [
              { text: "OK", onPress: () => { if (router.canGoBack()) router.back(); else router.replace('/(tabs)/rooms/archived'); } }
            ]);
          }
          setRoom(null); 
          setSensorData(null); 
        } else {
          setRoom(roomData); 
        }
      } else {
        if (room) { 
             Alert.alert("Room Deleted", "This room no longer exists.", [
                { text: "OK", onPress: () => { if (router.canGoBack()) router.back(); else router.replace('/(tabs)/rooms'); } }
            ]);
        }
        setRoom(null);
        setSensorData(null);
      }
      setIsLoading(false); 
    }, (error) => {
      console.error(`Error listening to room document ${roomId}:`, error);
      setIsLoading(false);
    });

    return () => unsubscribeRoomFirestore();
  }, [roomId, router, room?.isArchived]); // room?.isArchived to re-evaluate if it changes

  // Realtime Database listener for sensor data if esp32ModuleId is present
  useEffect(() => {
    if (room && room.esp32ModuleId && !room.isArchived) {
      setIsLoadingSensors(true);
      const rtdb: Database = getDatabase(app); // app imported from FirebaseConfig
      const sensorDataPath = `esp32_devices_data/${room.esp32ModuleId}/latest`;
      const latestDataRef = rtdbRef(rtdb, sensorDataPath);

      const listener = onValue(latestDataRef, (snapshot) => {
        const rawData = snapshot.val();
        if (rawData) {
          const newSensorData: Partial<RoomSensorData> = {};
          const now = new Date(rawData.timestamp ? rawData.timestamp * 1000 : Date.now());

          if (rawData.sht20) {
            newSensorData.tempHumidity = {
              id: `${room?.esp32ModuleId}-sht20`,
              name: `${room?.name || 'Room'} Environment (SHT20)`,
              temperature: typeof rawData.sht20.temperature === 'number' && rawData.sht20.temperature !== -99.9 ? rawData.sht20.temperature : 0,
              humidity: typeof rawData.sht20.humidity === 'number' && rawData.sht20.humidity !== -99.9 ? rawData.sht20.humidity : 0,
              status: 'normal', 
              timestamp: now,
            };
          }

          if (rawData.sds011) {
            newSensorData.airQuality = {
              id: `${room?.esp32ModuleId}-sds011`,
              name: `${room?.name || 'Room'} Air Quality (SDS011)`,
              pm25: typeof rawData.sds011.pm2_5 === 'number' ? rawData.sds011.pm2_5 : 0,
              pm10: typeof rawData.sds011.pm10 === 'number' ? rawData.sds011.pm10 : 0,
              status: 'normal', 
              timestamp: now,
            };
          }

          if (rawData.amg8833) {
            const pixelsArray = Array.isArray(rawData.amg8833.pixels) ? rawData.amg8833.pixels : [];
            const pixelRecord = flatPixelsToGrid(pixelsArray);
            newSensorData.thermalImager = {
              id: `${room?.esp32ModuleId}-amg8833`,
              name: `${room?.name || 'Room'} Thermal (AMG8833)`,
              pixels: pixelRecord,
              temperatures: pixelRecord,
              minTemp: typeof rawData.amg8833.min_temp === 'number' ? rawData.amg8833.min_temp : (pixelsArray.length > 0 ? Math.min(...pixelsArray) : 0),
              maxTemp: typeof rawData.amg8833.max_temp === 'number' ? rawData.amg8833.max_temp : 0,
              avgTemp: typeof rawData.amg8833.avg_temp === 'number' ? rawData.amg8833.avg_temp : 0,
              timestamp: now,
            };
          }
          
          if (rawData.mpu6050) {
            const ax = typeof rawData.mpu6050.accel_x === 'number' ? rawData.mpu6050.accel_x : 0;
            const ay = typeof rawData.mpu6050.accel_y === 'number' ? rawData.mpu6050.accel_y : 0;
            const az = typeof rawData.mpu6050.accel_z === 'number' ? rawData.mpu6050.accel_z : 0;
            const rms = Math.sqrt((ax*ax + ay*ay + az*az) / 3);

            newSensorData.vibration = {
                id: `${room?.esp32ModuleId}-mpu6050-vib`,
                name: `${room?.name || 'Room'} Vibration (MPU6050)`,
                rmsAcceleration: isNaN(rms) ? 0 : parseFloat(rms.toFixed(2)), 
                status: 'normal', 
                timestamp: now,
            };
          }
          setSensorData(newSensorData as RoomSensorData);
        } else {
          setSensorData(null); 
        }
        setIsLoadingSensors(false);
      }, (error) => {
        console.error(`Error listening to RTDB path ${sensorDataPath}:`, error);
        setSensorData(null);
        setIsLoadingSensors(false);
      });
      return () => off(latestDataRef, 'value', listener);
    } else {
      setSensorData(null);
      setIsLoadingSensors(false);
    }
  }, [room, app]); 

  const handleArchiveRoom = () => {
    if (!room) return;
    Alert.alert("Archive Room", `Are you sure you want to archive "${room.name}"?`,
      [{ text: "Cancel", style: "cancel" },
      { text: "Archive", style: "destructive", onPress: async () => {
        if (roomId) {
          setIsArchiving(true);
          try {
            await RoomService.archiveRoom(roomId);
            // Alert.alert("Success", `Room "${room.name}" has been archived.`); // Listener handles navigation
            // router.back(); // Listener handles navigation
          } catch (e: any) { console.error("Failed to archive room:", e); Alert.alert("Error", e.message || "Failed to archive room."); }
          finally { setIsArchiving(false); }
        }
      }}]);
  };
  const handleEditRoom = () => { if (roomId) router.push(`/modals/edit-room?roomId=${roomId}`); };

  const handleTestCameraConnection = useCallback(async (cameraId: string) => {
    setTestingCameraId(cameraId);
    try {
      const isConnected = await testConnection(cameraId);
      Alert.alert(
        'Connection Test',
        isConnected ? 'Camera connected successfully!' : 'Failed to connect to camera.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Connection Test', 'Error testing camera connection.', [{ text: 'OK' }]);
    } finally {
      setTestingCameraId(undefined);
    }
  }, [testConnection]);

  const onRefresh = useCallback(() => {
     setRefreshing(true);
     fetchRoomDetails(true); // This will re-fetch Firestore room details
     // RTDB listener will continue to provide live sensor data automatically
  }, [fetchRoomDetails]);

  const isOverallLoading = isLoading || (room?.esp32ModuleId && !room.isArchived && isLoadingSensors);

  if (isOverallLoading && !refreshing) {
    return (
      <ThemedView style={[styles.centered, { backgroundColor: containerBackgroundColor }]}>
        <ActivityIndicator size="large" color={tintColor} />
        <ThemedText style={[styles.loadingText, { color: textColor }]}>
          {isLoading ? "Loading room details..." : "Fetching sensor data..."}
        </ThemedText>
      </ThemedView>
    );
  }

  if (!room && !isLoading) { 
    return (
      <ThemedView style={[styles.centered, { backgroundColor: containerBackgroundColor }]}>
        <Ionicons name="alert-circle-outline" size={64} color={errorColor} />
        <ThemedText style={[styles.errorTitle, { color: errorColor, textAlign: 'center', marginBottom: Layout.spacing.md }]}>
          Room Not Available
        </ThemedText>
        <ThemedText style={[styles.errorText, { color: textColor, textAlign: 'center' }]}>
          This room may have been deleted or archived.
        </ThemedText>
        <TouchableOpacity
            style={[styles.primaryButton, {backgroundColor: tintColor}]}
            onPress={() => { if (router.canGoBack()) router.back(); else router.replace('/(tabs)/rooms');}}
            activeOpacity={0.7}
        >
            <Ionicons name="arrow-back-outline" size={20} color={primaryButtonTextColor} style={styles.buttonIcon} />
            <ThemedText style={[styles.primaryButtonText, {color: primaryButtonTextColor}]}>Go Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }
  
  // This check is crucial: only proceed to render room details if room is not null.
  if (!room) {
      // This case should ideally be caught by the loading state or the !room && !isLoading block above.
      // Adding it here as an explicit safeguard.
      return (
          <ThemedView style={[styles.centered, { backgroundColor: containerBackgroundColor }]}>
            <ActivityIndicator size="large" color={tintColor} />
            <ThemedText style={{ color: textColor, marginTop: Layout.spacing.md }}>Loading...</ThemedText>
          </ThemedView>
      );
  }


  const tempHumidity = sensorData?.tempHumidity as TempHumidityData | undefined;
  const airQuality = sensorData?.airQuality as AirQualityData | undefined;
  const thermalData = sensorData?.thermalImager as ThermalImagerData | undefined;
  const vibrationData = sensorData?.vibration as VibrationData | undefined;

  return (
    <>
      <Stack.Screen options={{ title: room.name || 'Room Details' }} />
      <ScrollView
        style={[styles.container, { backgroundColor: containerBackgroundColor }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={tintColor} />}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Room Info Header Card */}
        <Card style={styles.headerCard}>
          <View style={styles.roomHeader}>
            <View style={styles.roomTitleSection}>
              <ThemedText style={[styles.roomName, { color: textColor }]}>
                {room.name}
              </ThemedText>
              <View style={styles.statusBadge}>
                <Ionicons 
                  name={room.isMonitored ? "shield-checkmark" : "shield-outline"} 
                  size={16} 
                  color={room.isMonitored ? successColor : warningColor} 
                />
                <ThemedText style={[
                  styles.statusText, 
                  { color: room.isMonitored ? successColor : warningColor }
                ]}>
                  {room.isMonitored ? "MONITORING" : "PAUSED"}
                </ThemedText>
              </View>
            </View>

            <View style={styles.roomMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="location-outline" size={16} color={subtleTextColor} />
                <ThemedText style={[styles.metaText, { color: subtleTextColor }]}>
                  {room.location}
                </ThemedText>
              </View>
              {room.esp32ModuleName && (
                <View style={styles.metaItem}>
                  <Ionicons name="hardware-chip-outline" size={16} color={subtleTextColor} />
                  <ThemedText style={[styles.metaText, { color: subtleTextColor }]}>
                    {room.esp32ModuleName}
                  </ThemedText>
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: tintColor + '15', borderColor: tintColor }]}
                onPress={handleEditRoom}
                activeOpacity={0.7}
              >
                <Ionicons name="pencil-outline" size={18} color={tintColor} />
                <ThemedText style={[styles.actionButtonText, { color: tintColor }]}>
                  Edit
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: errorColor + '15', borderColor: errorColor }]}
                onPress={handleArchiveRoom}
                disabled={isArchiving}
                activeOpacity={0.7}
              >
                {isArchiving ? (
                  <ActivityIndicator size="small" color={errorColor} />
                ) : (
                  <>
                    <Ionicons name="archive-outline" size={18} color={errorColor} />
                    <ThemedText style={[styles.actionButtonText, { color: errorColor }]}>
                      Archive
                    </ThemedText>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Card>

        {/* Sensor Data Section */}
        <View style={styles.sectionHeader}>
          <Ionicons name="analytics-outline" size={24} color={sectionTitleColor} />
          <ThemedText style={[styles.sectionTitle, { color: sectionTitleColor }]}>
            Live Sensor Data
          </ThemedText>
        </View>
        
        {(!sensorData && !isLoadingSensors && room.esp32ModuleId && !refreshing) && (
          <Card style={styles.emptyStateCard}>
            <Ionicons name="cloud-offline-outline" size={48} color={subtleTextColor} />
            <ThemedText style={[styles.emptyStateTitle, { color: textColor }]}>
              Waiting for Data
            </ThemedText>
            <ThemedText style={[styles.emptyStateText, { color: subtleTextColor }]}>
              No data received yet from {room.esp32ModuleName || 'the ESP32 module'}. Ensure it's online and sending data to Firebase RTDB.
            </ThemedText>
          </Card>
        )}

         {(!room.esp32ModuleId && !isLoading && !refreshing) && (
          <Card style={styles.emptyStateCard}>
            <Ionicons name="hardware-chip-outline" size={48} color={subtleTextColor} />
            <ThemedText style={[styles.emptyStateTitle, { color: textColor }]}>
              No ESP32 Linked
            </ThemedText>
            <ThemedText style={[styles.emptyStateText, { color: subtleTextColor }]}>
              Link an ESP32 module to this room to see live sensor data.
            </ThemedText>
          </Card>
        )}

        {isLoadingSensors && !refreshing && room.esp32ModuleId && (
          <Card style={styles.loadingCard}>
            <ActivityIndicator size="large" color={tintColor} />
            <ThemedText style={[styles.loadingText, { color: textColor }]}>
              Connecting to ESP32 data...
            </ThemedText>
          </Card>
        )}


        {/* Environmental Data */}
        {(tempHumidity || airQuality) && (
          <Card style={styles.sensorCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="leaf-outline" size={20} color={successColor} />
              <ThemedText style={[styles.cardTitle, { color: textColor }]}>
                Environmental
              </ThemedText>
            </View>
            
            <View style={styles.gaugesGrid}>
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
            </View>
            
            <View style={styles.gaugesGrid}>
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
            </View>
          </Card>
        )}

        {/* Thermal Imaging */}
        {thermalData && (
          <Card style={styles.sensorCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="thermometer-outline" size={20} color={warningColor} />
              <ThemedText style={[styles.cardTitle, { color: textColor }]}>
                {thermalData.name || "Thermal Imaging"}
              </ThemedText>
            </View>
            
            <HeatmapGrid data={thermalData.pixels} minTempThreshold={15} maxTempThreshold={45} />
            
            <View style={[styles.thermalStats, { borderTopColor: cardBorderColor }]}>
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
            </View>
            
            <View style={styles.thermalTextStats}>
              <ThemedText style={[styles.statText, { color: textColor }]}>
                Min: {thermalData.minTemp.toFixed(1)}°C
              </ThemedText>
              <ThemedText style={[styles.statText, { color: textColor }]}>
                Avg: {thermalData.avgTemp.toFixed(1)}°C
              </ThemedText>
              <ThemedText style={[styles.statText, { color: textColor }]}>
                Max: {thermalData.maxTemp.toFixed(1)}°C
              </ThemedText>
            </View>
          </Card>
        )}

        {/* Vibration Data */}
        {vibrationData && (
          <Card style={styles.sensorCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="pulse-outline" size={20} color={errorColor} />
              <ThemedText style={[styles.cardTitle, { color: textColor }]}>
                {vibrationData.name || "Vibration Sensor"}
              </ThemedText>
            </View>
            
            <View style={styles.vibrationContainer}>
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
              <ThemedText style={[styles.vibrationStatus, { color: textColor }]}>
                {`${vibrationData.name || 'Vibration Sensor'} - ${vibrationData.status || 'Unknown'}`}
              </ThemedText>
            </View>
          </Card>
        )}

        {/* Camera Monitoring Section */}
        {roomId && (
          <CameraSection
            roomId={roomId}
            cameras={cameras}
            isLoading={isLoadingCameras}
            onTestConnection={handleTestCameraConnection}
            testingCameraId={testingCameraId}
          />
        )}

        {/* Bottom spacing */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Layout.spacing.md,
    paddingBottom: Layout.spacing.xl,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.xl,
  },
  
  // Loading & Error States
  loadingText: {
    marginTop: Layout.spacing.md,
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Medium',
    textAlign: 'center',
  },
  errorTitle: {
    marginTop: Layout.spacing.md,
    fontSize: Layout.fontSize.xl,
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
  },
  errorText: {
    marginTop: Layout.spacing.sm,
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    marginBottom: Layout.spacing.lg,
  },
  
  // Header Card
  headerCard: {
    marginBottom: Layout.spacing.lg,
    padding: Layout.spacing.lg,
  },
  roomHeader: {
    gap: Layout.spacing.md,
  },
  roomTitleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.sm,
  },
  roomName: {
    flex: 1,
    fontSize: Layout.fontSize.xxl,
    fontFamily: 'Montserrat-Bold',
    marginRight: Layout.spacing.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs / 2,
    borderRadius: Layout.borderRadius.sm,
    backgroundColor: 'transparent',
  },
  statusText: {
    fontSize: Layout.fontSize.xs,
    fontFamily: 'Montserrat-Bold',
    marginLeft: Layout.spacing.xs / 2,
  },
  roomMeta: {
    gap: Layout.spacing.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.xs,
  },
  metaText: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Medium',
  },
  
  // Action Buttons
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: Layout.spacing.sm,
    marginTop: Layout.spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    flex: 1,
    minHeight: 44,
  },
  actionButtonText: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-SemiBold',
    marginLeft: Layout.spacing.xs,
  },
  
  // Primary Button
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.md,
    marginTop: Layout.spacing.lg,
  },
  primaryButtonText: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-SemiBold',
    marginLeft: Layout.spacing.xs,
  },
  buttonIcon: {
    marginRight: Layout.spacing.xs,
  },
  
  // Section Headers
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
    gap: Layout.spacing.sm,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.lg,
    fontFamily: 'Montserrat-Bold',
  },
  
  // Cards
  sensorCard: {
    marginBottom: Layout.spacing.md,
    padding: Layout.spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
    gap: Layout.spacing.sm,
  },
  cardTitle: {
    fontSize: Layout.fontSize.lg,
    fontFamily: 'Montserrat-SemiBold',
  },
  
  // Empty States
  emptyStateCard: {
    alignItems: 'center',
    padding: Layout.spacing.xl,
    marginBottom: Layout.spacing.md,
  },
  emptyStateTitle: {
    fontSize: Layout.fontSize.lg,
    fontFamily: 'Montserrat-SemiBold',
    marginTop: Layout.spacing.md,
    marginBottom: Layout.spacing.sm,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
  },
  
  loadingCard: {
    alignItems: 'center',
    padding: Layout.spacing.xl,
    marginBottom: Layout.spacing.md,
  },
  
  // Sensor Data
  gaugesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    marginBottom: Layout.spacing.md,
  },
  
  // Thermal Stats
  thermalStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: Layout.spacing.md,
    paddingTop: Layout.spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    // borderTopColor is now applied dynamically
  },
  thermalTextStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Layout.spacing.md,
    paddingTop: Layout.spacing.sm,
  },
  statText: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Medium',
  },
  
  // Vibration
  vibrationContainer: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.lg,
  },
  vibrationStatus: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Medium',
    marginTop: Layout.spacing.md,
    textAlign: 'center',
  },
  
  bottomSpacer: {
    height: Layout.spacing.xl,
  },
});