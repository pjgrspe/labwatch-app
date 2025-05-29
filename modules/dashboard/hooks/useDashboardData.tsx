// Modify labwatch-app/modules/dashboard/hooks/useDashboardData.tsx

import { AlertService } from '@/modules/alerts/services/AlertService'; // Import AlertService
import { RoomService } from '@/modules/rooms/services/RoomService';
import { Alert as AlertType } from '@/types/alerts'; // Import your Alert type
import { Room, RoomSensorData } from '@/types/rooms';
import {
  AirQualityData,
  TempHumidityData,
  ThermalImagerData,
} from '@/types/sensor';
import { useGlobalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';

// Remove dummyAlerts and AlertItemType if AlertType from types/alerts.ts is sufficient
// export interface AlertItemType { id: string; type: string; location: string; time: string; severity: 'critical' | 'high' | 'medium' | 'low'; icon: keyof typeof Ionicons.glyphMap; details?: string; }
// const dummyAlerts: AlertItemType[] = [ { id: 'alert1', type: 'Fire Alarm', location: 'Lab A - Sector 2', time: '2 min ago', severity: 'critical', icon: 'flame' }, { id: 'alert2', type: 'Temperature Anomaly', location: 'Freezer #3', time: '15 min ago', severity: 'high', icon: 'thermometer' },];


export function useDashboardData() {
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [currentRoomSensorData, setCurrentRoomSensorData] = useState<RoomSensorData | null>(null);
  const [recentAlerts, setRecentAlerts] = useState<AlertType[]>([]); // Use AlertType
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [isLoadingSensors, setIsLoadingSensors] = useState(false);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(true); // New loading state for alerts
  const [refreshing, setRefreshing] = useState(false);

  const params = useGlobalSearchParams();
  const initialRoomIdFromParams = params.roomId as string | undefined;

  useEffect(() => {
    setIsLoadingRooms(true);
    const unsubscribeRooms = RoomService.onRoomsUpdate(
      (fetchedRooms) => {
        setAllRooms(fetchedRooms);
        if (fetchedRooms.length > 0) {
          const targetRoomId = initialRoomIdFromParams && fetchedRooms.some(r => r.id === initialRoomIdFromParams)
            ? initialRoomIdFromParams
            : fetchedRooms[0].id;
          if (selectedRoomId !== targetRoomId) {
            setSelectedRoomId(targetRoomId);
          }
        } else {
          setSelectedRoomId(null);
        }
        setIsLoadingRooms(false);
      },
       (error) => {
        console.error("Error fetching rooms:", error);
        setIsLoadingRooms(false);
      }
    );

    // Fetch alerts
    setIsLoadingAlerts(true);
    const unsubscribeAlerts = AlertService.onAlertsUpdate(
        (fetchedAlerts) => {
            setRecentAlerts(fetchedAlerts.slice(0, 5)); // Get top 5 recent alerts
            setIsLoadingAlerts(false);
        },
        (error) => {
            console.error("Error fetching alerts for dashboard:", error);
            setIsLoadingAlerts(false);
        }
    );


    return () => {
        unsubscribeRooms();
        unsubscribeAlerts();
    };
  }, [initialRoomIdFromParams]); // Removed selectedRoomId to avoid re-fetching alerts on room change in this specific effect

  useEffect(() => {
    let unsubscribeSensors = () => {};
    if (selectedRoomId) {
      setIsLoadingSensors(true);
      unsubscribeSensors = RoomService.onRoomSensorsUpdate(
        selectedRoomId,
        (sensors) => {
          setCurrentRoomSensorData(sensors);
          setIsLoadingSensors(false);
        },
        (error: any) => { // Added error callback
          console.error(`Error fetching sensors for room ${selectedRoomId}:`, error);
          setCurrentRoomSensorData(null);
          setIsLoadingSensors(false);
        }
      );
    } else {
      setCurrentRoomSensorData(null);
      setIsLoadingSensors(false);
    }
    return () => unsubscribeSensors();
  }, [selectedRoomId]);

  const availableRoomNames = useMemo(() => {
    const names = allRooms.map(room => room.name);
    return names.length > 0 ? names : ['No Rooms Available'];
  }, [allRooms]);

  const getRoomIdByName = (name: string): string | null => {
    const room = allRooms.find(r => r.name === name);
    return room ? room.id : null;
  };

  const handleSelectRoomByName = (nameOrId: string) => {
    const roomId = getRoomIdByName(nameOrId);
    if (roomId) {
      setSelectedRoomId(roomId);
    }
  };

  const selectedRoomObject = useMemo(() => allRooms.find(r => r.id === selectedRoomId), [allRooms, selectedRoomId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // The onSnapshot listeners should handle updates, but explicit fetch can be added if needed.
      // For instance, to ensure the very latest data if listeners have delays or issues:
      const fetchedRooms = await RoomService.getRooms();
      setAllRooms(fetchedRooms); // Update rooms state

      if (selectedRoomId) {
        const sensors = await RoomService.getSensorsForRoom(selectedRoomId);
        setCurrentRoomSensorData(sensors);
      }
      const alerts = await AlertService.getAlerts();
      setRecentAlerts(alerts.slice(0,5));

    } catch (error) {
      console.error("Error during refresh:", error);
    }
    setRefreshing(false);
  }, [selectedRoomId]);

  const hasAnySensorDataForSelectedRoom = currentRoomSensorData
    ? Object.values(currentRoomSensorData).some(sensor => sensor !== undefined)
    : false;

  const selectedRoomTempHumidity = currentRoomSensorData?.tempHumidity as TempHumidityData | undefined;
  const selectedRoomAirQuality = currentRoomSensorData?.airQuality as AirQualityData | undefined;
  const selectedRoomThermalData = currentRoomSensorData?.thermalImager as ThermalImagerData | undefined;

  const otherMonitoredRooms = useMemo(() => {
    return allRooms
      .filter(room => room.id !== selectedRoomId && room.isMonitored)
      .slice(0, 2)
      .map(room => ({
        id: `${room.id}-th-preview`,
        roomId: room.id,
        name: room.name,
        temperature: 20 + Math.random() * 5,
        humidity: 40 + Math.random() * 10,
        status: 'normal' as TempHumidityData['status'],
        timestamp: new Date(),
      }));
  }, [allRooms, selectedRoomId]);

  return {
    selectedRoomId: selectedRoomObject?.name || 'No Rooms Available',
    setSelectedRoomId: handleSelectRoomByName,
    availableRooms: availableRoomNames,
    isLoading: isLoadingRooms || (selectedRoomId !== null && isLoadingSensors) || isLoadingAlerts, // Include isLoadingAlerts

    selectedRoomTempHumidity,
    selectedRoomAirQuality,
    selectedRoomThermalData,
    hasAnySensorDataForSelectedRoom,

    recentAlerts, // Use real alerts
    otherMonitoredRooms,
    refreshing,
    onRefresh,
  };
}