// app/(tabs)/rooms/[roomId].tsx
import Card from '@/components/Card';
import { Text as ThemedText, View as ThemedView, View } from '@/components/Themed';
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
  const warningColor = useThemeColor({}, 'warningText');
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
            style={[styles.primaryButton, {backgroundColor: tintColor}]}
            onPress={() => router.back()}
            activeOpacity={0.7}
        >
            <ThemedText style={[styles.primaryButtonText, {color: primaryButtonTextColor}]}>Go Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const tempHumidity = sensorData?.tempHumidity as TempHumidityData | undefined;
  const airQuality = sensorData?.airQuality as AirQualityData | undefined;
  const thermalData = sensorData?.thermalImager as ThermalImagerData | undefined;
  const vibrationData = sensorData?.vibration as VibrationData | undefined;

  if (isLoading && !refreshing) {
    return (
      <ThemedView style={[styles.centered, { backgroundColor: containerBackgroundColor }]}>
        <ActivityIndicator size="large" color={tintColor} />
        <ThemedText style={[styles.loadingText, { color: textColor }]}>
          Loading room details...
        </ThemedText>
      </ThemedView>
    );
  }

  if (!room) {
    return (
      <ThemedView style={[styles.centered, { backgroundColor: containerBackgroundColor }]}>
        <Ionicons name="warning-outline" size={64} color={errorColor} />
        <ThemedText style={[styles.errorTitle, { color: errorColor }]}>
          Room Not Found
        </ThemedText>
        <ThemedText style={[styles.errorText, { color: textColor }]}>
          This room may have been archived or deleted.
        </ThemedText>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: tintColor }]}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color={primaryButtonTextColor} style={styles.buttonIcon} />
          <ThemedText style={[styles.primaryButtonText, { color: primaryButtonTextColor }]}>
            Go Back
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: room?.name || 'Room Details' }} />
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

        {!sensorData && !isLoading && !refreshing && (
          <Card style={styles.emptyStateCard}>
            <Ionicons name="radio-outline" size={48} color={subtleTextColor} />
            <ThemedText style={[styles.emptyStateTitle, { color: textColor }]}>
              No Sensor Data
            </ThemedText>
            <ThemedText style={[styles.emptyStateText, { color: subtleTextColor }]}>
              No sensor data is currently available for this room.
            </ThemedText>
          </Card>
        )}

        {isLoading && !refreshing && !sensorData && room && !room.isArchived && (
          <Card style={styles.loadingCard}>
            <ActivityIndicator size="large" color={tintColor} />
            <ThemedText style={[styles.loadingText, { color: textColor }]}>
              Loading sensor data...
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
                Vibration Sensor
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