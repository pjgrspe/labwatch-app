// Modify labwatch-app/modules/dashboard/hooks/useDashboardData.tsx

import { AlertService } from '@/modules/alerts/services/AlertService';
import { RoomService } from '@/modules/rooms/services/RoomService';
import { Alert as AlertType } from '@/types/alerts';
import { Room, RoomSensorData } from '@/types/rooms';
import {
  AirQualityData,
  TempHumidityData,
  ThermalImagerData,
} from '@/types/sensor';
import { useGlobalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';


export function useDashboardData() {
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [currentRoomSensorData, setCurrentRoomSensorData] = useState<RoomSensorData | null>(null);
  const [recentAlerts, setRecentAlerts] = useState<AlertType[]>([]); 
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [isLoadingSensors, setIsLoadingSensors] = useState(false);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(true); 
  const [refreshing, setRefreshing] = useState(false);

  const params = useGlobalSearchParams();
  const initialRoomIdFromParams = params.roomId as string | undefined;

  useEffect(() => {
    setIsLoadingRooms(true);
    const unsubscribeRooms = RoomService.onRoomsUpdate(
      (fetchedRooms) => {
        const safeFetchedRooms = fetchedRooms || []; // Guard
        setAllRooms(safeFetchedRooms);
        if (safeFetchedRooms.length > 0) {
          const targetRoomId = initialRoomIdFromParams && safeFetchedRooms.some(r => r.id === initialRoomIdFromParams)
            ? initialRoomIdFromParams
            : safeFetchedRooms[0].id;
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
        setAllRooms([]); // Ensure it's an array on error
        setIsLoadingRooms(false);
      }
    );

    setIsLoadingAlerts(true);
    const unsubscribeAlerts = AlertService.onAlertsUpdate(
        (fetchedAlerts) => {
            const safeFetchedAlerts = fetchedAlerts || []; // Guard
            setRecentAlerts(safeFetchedAlerts.slice(0, 5)); 
            setIsLoadingAlerts(false);
        },
        (error) => {
            console.error("Error fetching alerts for dashboard:", error);
            setRecentAlerts([]); // Ensure it's an array on error
            setIsLoadingAlerts(false);
        }
    );

    return () => {
        unsubscribeRooms();
        unsubscribeAlerts();
    };
  }, [initialRoomIdFromParams]); 

  useEffect(() => {
    let unsubscribeSensors = () => {};
    if (selectedRoomId) {
      setIsLoadingSensors(true);
      unsubscribeSensors = RoomService.onRoomSensorsUpdate(
        selectedRoomId,
        (sensors) => {
          setCurrentRoomSensorData(sensors); // sensors should be RoomSensorData | null from service
          setIsLoadingSensors(false);
        },
        (error: any) => { 
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
    const names = (allRooms || []).map(room => room.name); // Guard allRooms
    return names.length > 0 ? names : ['No Rooms Available'];
  }, [allRooms]);

  const getRoomIdByName = (name: string): string | null => {
    const room = (allRooms || []).find(r => r.name === name); // Guard allRooms
    return room ? room.id : null;
  };

  const handleSelectRoomByName = (nameOrId: string) => {
    const roomId = getRoomIdByName(nameOrId);
    if (roomId) {
      setSelectedRoomId(roomId);
    } else if ((allRooms || []).some(r => r.id === nameOrId)) { // Guard allRooms, handle if ID is passed
        setSelectedRoomId(nameOrId);
    }
  };

  const selectedRoomObject = useMemo(() => (allRooms || []).find(r => r.id === selectedRoomId), [allRooms, selectedRoomId]); // Guard allRooms

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const fetchedRooms = await RoomService.getRooms();
      setAllRooms(fetchedRooms || []); // Guard

      if (selectedRoomId) {
        const sensors = await RoomService.getSensorsForRoom(selectedRoomId);
        setCurrentRoomSensorData(sensors);
      }
      const alerts = await AlertService.getAlerts();
      setRecentAlerts((alerts || []).slice(0,5)); // Guard

    } catch (error) {
      console.error("Error during refresh:", error);
      // Ensure states are arrays even on error if necessary, though they retain old values here.
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
    return (allRooms || []) // Guard allRooms
      .filter(room => room.id !== selectedRoomId && room.isMonitored)
      .slice(0, 2)
      .map(room => ({
        id: `${room.id}-th-preview`,
        roomId: room.id,
        name: room.name,
        temperature: 20 + Math.random() * 5, // Example data, replace with actual if available
        humidity: 40 + Math.random() * 10, // Example data
        status: 'normal' as TempHumidityData['status'],
        timestamp: new Date(),
      }));
  }, [allRooms, selectedRoomId]);

  return {
    selectedRoomId: selectedRoomObject?.name || 'No Rooms Available',
    setSelectedRoomId: handleSelectRoomByName,
    availableRooms: availableRoomNames,
    isLoading: isLoadingRooms || (selectedRoomId !== null && isLoadingSensors) || isLoadingAlerts, 

    selectedRoomTempHumidity,
    selectedRoomAirQuality,
    selectedRoomThermalData,
    hasAnySensorDataForSelectedRoom,

    recentAlerts, 
    otherMonitoredRooms,
    refreshing,
    onRefresh,
  };
}