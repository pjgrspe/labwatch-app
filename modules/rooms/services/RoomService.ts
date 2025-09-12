// Modify labwatch-app/modules/rooms/services/RoomService.ts

import { db } from '@/FirebaseConfig';
import { AlertService } from '@/modules/alerts/services/AlertService';
import { Room, RoomSensorData } from '@/types/rooms';
import { AirQualityData, TempHumidityData, ThermalImagerData, VibrationData } from '@/types/sensor';
import { convertTimestamps } from '@/utils/firebaseUtils';
import {
  addDoc,
  collection, deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Unsubscribe,
  updateDoc,
  where
} from 'firebase/firestore';

export const ROOMS_COLLECTION = 'rooms';
const SENSORS_SUBCOLLECTION = 'sensors';

const lastProcessedSensorData = new Map<string, any>();

export const RoomService = {
  addRoom: async (roomData: Partial<Omit<Room, 'id' | 'createdAt' | 'isArchived' | 'archivedAt'>>): Promise<string> => { // Modified to accept more fields
    try {
      const roomCollectionRef = collection(db, ROOMS_COLLECTION);
      const docRef = await addDoc(roomCollectionRef, {
        name: roomData.name || 'Unnamed Room',
        location: roomData.location || 'No Location',
        isMonitored: roomData.isMonitored !== undefined ? roomData.isMonitored : true,
        esp32ModuleId: roomData.esp32ModuleId || null,
        esp32ModuleName: roomData.esp32ModuleName || null,
        createdAt: serverTimestamp(),
        isArchived: false, 
      });
      console.log('Room added with ID:', docRef.id);

      // Default sensor initialization (if needed for your logic, otherwise can be removed if RTDB is sole source for ESP32s)
      // const defaultSensors = initializeDefaultSensorData(docRef.id, roomData.name || 'Unnamed Room');
      // const sensorsCollectionRef = collection(db, ROOMS_COLLECTION, docRef.id, SENSORS_SUBCOLLECTION);
      // const batch = writeBatch(db);
      // Object.entries(defaultSensors).forEach(([sensorType, sensorDataEntry]) => {
      //   const typedSensorDataEntry = sensorDataEntry as TempHumidityData | AirQualityData | ThermalImagerData | VibrationData | undefined;
      //   if (typedSensorDataEntry && typedSensorDataEntry.id) {
      //     const sensorDocRef = doc(sensorsCollectionRef, typedSensorDataEntry.id);
      //     batch.set(sensorDocRef, { ...typedSensorDataEntry, type: sensorType, lastUpdate: serverTimestamp() });
      //   }
      // });
      // await batch.commit();
      // console.log('Default sensor data initialized for room:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("Error adding room:", error);
      throw error;
    }
  },

  // --- START: New method to get all ESP32 Module IDs in use ---
  getAllEsp32ModuleIdsInUse: async (): Promise<Set<string>> => {
    const assignedIds = new Set<string>();    try {
      const roomsCollectionRef = collection(db, ROOMS_COLLECTION);
      // Fetch all rooms, regardless of archived status,
      // as an ESP32 assigned to any existing room is considered "in use".
      const querySnapshot = await getDocs(roomsCollectionRef);
      if (querySnapshot && !querySnapshot.empty) {
        querySnapshot.forEach(doc => {
          const data = doc.data();
          if (data.esp32ModuleId && typeof data.esp32ModuleId === 'string' && data.esp32ModuleId.trim() !== '') {
            assignedIds.add(data.esp32ModuleId);
          }
        });
      }
      return assignedIds;
    } catch (error) {
      console.error("Error fetching all assigned ESP32 module IDs:", error);
      return assignedIds; // Return whatever was collected, or an empty set on error
    }
  },
  // --- END: New method ---

  getRooms: async (): Promise<Room[]> => {
    try {
      const roomsCollectionRef = collection(db, ROOMS_COLLECTION);
      const q = query(roomsCollectionRef, where("isArchived", "==", false), orderBy("name", "asc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return convertTimestamps({
          id: doc.id,
          name_or_id: data.name || doc.id, // Kept for compatibility if used elsewhere
          ...data
        }) as Room;
      });
    } catch (error) {
      console.error("Error fetching rooms:", error);
      throw error;
    }
  },

  getArchivedRooms: async (): Promise<Room[]> => {
    try {
      const roomsCollectionRef = collection(db, ROOMS_COLLECTION);
      const q = query(roomsCollectionRef, where("isArchived", "==", true), orderBy("archivedAt", "desc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return convertTimestamps({
          id: doc.id,
          name_or_id: data.name || doc.id,
          ...data
        }) as Room;
      });
    } catch (error) {
      console.error("Error fetching archived rooms:", error);
      throw error;
    }
  },

  getRoomById: async (roomId: string): Promise<Room | null> => {
    try {
      const roomDocRef = doc(db, ROOMS_COLLECTION, roomId);
      const docSnap = await getDoc(roomDocRef);
      if (docSnap.exists()) {
        return convertTimestamps({ id: docSnap.id, ...docSnap.data() }) as Room;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching room ${roomId}:`, error);
      throw error;
    }
  },

  updateRoom: async (roomId: string, updatedData: Partial<Omit<Room, 'id' | 'createdAt'>>): Promise<void> => {
    try {
      const roomDocRef = doc(db, ROOMS_COLLECTION, roomId);
      // Ensure null values for esp32ModuleId/Name are handled correctly to unset them.
      const dataToUpdate = { ...updatedData };
      if (dataToUpdate.esp32ModuleId === null) {
        dataToUpdate.esp32ModuleId = undefined; // Or use FieldValue.delete() if you want to remove the field
      }
       if (dataToUpdate.esp32ModuleName === null) {
        dataToUpdate.esp32ModuleName = undefined; // Or use FieldValue.delete()
      }
      await updateDoc(roomDocRef, dataToUpdate);
      console.log('Room updated:', roomId);
    } catch (error) {
      console.error(`Error updating room ${roomId}:`, error);
      throw error;
    }
  },

  archiveRoom: async (roomId: string): Promise<void> => {
    try {
      const roomDocRef = doc(db, ROOMS_COLLECTION, roomId);
      await updateDoc(roomDocRef, {
        isArchived: true,
        archivedAt: serverTimestamp(), // Use serverTimestamp for consistency
        isMonitored: false,
      });
      console.log('Room archived:', roomId);
    } catch (error: any) {
      console.error(`Error archiving room ${roomId}:`, error);
      throw new Error(`Failed to archive room: ${error.message}`);
    }
  },

  restoreRoom: async (roomId: string): Promise<void> => {
    try {
      const roomDocRef = doc(db, ROOMS_COLLECTION, roomId);
      await updateDoc(roomDocRef, {
        isArchived: false,
        archivedAt: null, 
        // Optionally, decide if isMonitored should be reset to true or kept as is
      });
      console.log('Room restored:', roomId);
    } catch (error: any) {
      console.error(`Error restoring room ${roomId}:`, error);
      throw new Error(`Failed to restore room: ${error.message}`);
    }
  },

  deleteRoom: async (roomId: string): Promise<void> => {
    try {
      console.log(`Attempting to delete room: ${roomId}`);
      const roomDocRef = doc(db, ROOMS_COLLECTION, roomId);
      await deleteDoc(roomDocRef);
      console.log(`Room ${roomId} deleted successfully`);
    } catch (error: any) {
      console.error(`Error deleting room ${roomId}:`, error);
      throw new Error(`Failed to delete room: ${error.message}`);
    }
  },
  getSensorsForRoom: async (roomId: string): Promise<RoomSensorData> => {
    const sensors: Partial<RoomSensorData> = {};
    try {
      const sensorsCollectionRef = collection(db, ROOMS_COLLECTION, roomId, SENSORS_SUBCOLLECTION);
      const querySnapshot = await getDocs(sensorsCollectionRef);
      if (querySnapshot && !querySnapshot.empty) {
        querySnapshot.forEach(docSnapshot => { // Changed from forEach to docSnapshot
          const data = docSnapshot.data();
          const sensorType = data.type as keyof RoomSensorData;
          if (sensorType) {
            sensors[sensorType] = convertTimestamps(data) as any;
          }
        });
      }
      return sensors as RoomSensorData;
    } catch (error) {
      console.error(`Error fetching sensors for room ${roomId}:`, error);
      throw error;
    }
  },

  updateTempHumiditySensor: async (
    roomId: string,
    sensorId: string,
    data: Partial<Omit<TempHumidityData, 'id' | 'name' | 'timestamp'>>
  ): Promise<void> => {
    try {
      const sensorDocRef = doc(db, ROOMS_COLLECTION, roomId, SENSORS_SUBCOLLECTION, sensorId);
      await updateDoc(sensorDocRef, { ...data, timestamp: serverTimestamp(), lastUpdate: serverTimestamp() });
      console.log(`Temp/Humidity sensor ${sensorId} in room ${roomId} updated.`);
    } catch (error) {
      console.error(`Error updating sensor ${sensorId}:`, error);
      throw error;
    }
  },

  onRoomsUpdate: (
    onNext: (rooms: Room[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe => {
    const roomsCollectionRef = collection(db, ROOMS_COLLECTION);
    const q = query(roomsCollectionRef, where("isArchived", "==", false), orderBy("name", "asc"));
    return onSnapshot(q,
        (querySnapshot) => {
            const rooms = querySnapshot.docs.map(docSnapshot => { // Changed from doc to docSnapshot
                const data = docSnapshot.data();
                return convertTimestamps({
                    id: docSnapshot.id,
                    name_or_id: data.name || docSnapshot.id,
                    ...data
                }) as Room;
            });
            onNext(rooms);
        },
        (error) => {
            console.error("Error listening to room updates via RoomService:", error);
            if (onError) {
                onError(error);
            }
        }
    );
  },

  onArchivedRoomsUpdate: ( 
    onNext: (rooms: Room[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe => {
    const roomsCollectionRef = collection(db, ROOMS_COLLECTION);
    const q = query(roomsCollectionRef, where("isArchived", "==", true), orderBy("archivedAt", "desc"));
    return onSnapshot(q,
        (querySnapshot) => {
            const rooms = querySnapshot.docs.map(docSnapshot => { // Changed from doc to docSnapshot
                const data = docSnapshot.data();
                return convertTimestamps({
                    id: docSnapshot.id,
                    name_or_id: data.name || docSnapshot.id,
                    ...data
                }) as Room;
            });
            onNext(rooms);
        },
        (error) => {
            console.error("Error listening to archived room updates:", error);
            if (onError) {
                onError(error);
            }
        }
    );
  },

  onRoomSensorsUpdate: (
    roomId: string, callback: (sensors: RoomSensorData) => void, onErrorCallback?: (error: any) => void  ): Unsubscribe => { // Added onErrorCallback
    const sensorsCollectionRef = collection(db, ROOMS_COLLECTION, roomId, SENSORS_SUBCOLLECTION);

    let roomName = `Room ${roomId}`; // Initialize with a fallback
    
    // Fetch room name once for alert messages
    const roomDocRef = doc(db, ROOMS_COLLECTION, roomId);
    getDoc(roomDocRef).then(roomDocSnap => {
        if(roomDocSnap.exists()) {
            roomName = roomDocSnap.data()?.name || roomName;
        }    }).catch(e => console.error(`Failed to fetch room name for ${roomId} during sensor update setup: `, e));

    return onSnapshot(sensorsCollectionRef,
      (querySnapshot) => {
        const sensors: Partial<RoomSensorData> = {};
        if (querySnapshot && !querySnapshot.empty) {
          querySnapshot.forEach(docSnapshot => {
            const data = docSnapshot.data();
            const sensorType = data.type as keyof RoomSensorData; // Assume 'type' field exists in sensor doc
            const sensorId = docSnapshot.id;
            const sensorKey = `${roomId}-${sensorId}`;

            if (sensorType) {
              const liveData = convertTimestamps(data) as any;
              sensors[sensorType] = liveData;

              const lastData = lastProcessedSensorData.get(sensorKey);
              const hasDataChanged = !lastData || hasSignificantChange(lastData, liveData, sensorType);

            if (hasDataChanged) {
              console.log(`Detected data change for ${sensorType} in room ${roomId} (Name: ${roomName}), checking for alerts`);
              lastProcessedSensorData.set(sensorKey, { ...liveData });

              // Ensure roomName is resolved or fallback is used
              const currentRoomName = roomName || `Room ${roomId}`;              AlertService.checkForAlerts(roomId, currentRoomName, sensorId, sensorType, liveData)
                .catch(e => console.error(`Error during AlertService.checkForAlerts for ${sensorType} in ${currentRoomName} (Sensor ID: ${sensorId}):`, e));
            }
          }
          });
        }
        callback(sensors as RoomSensorData);      },
      (error: any) => {
        console.error(`Firebase onSnapshot error for sensors in room ${roomId}:`, error);
        if (onErrorCallback) { // Use the provided error callback
            onErrorCallback(error);
        }
      }
    );
  },

  updateAirQualitySensor: async (roomId: string, sensorId: string, data: Partial<Omit<AirQualityData, 'id' | 'name' | 'timestamp'>>): Promise<void> => {
    try {
        const sensorDocRef = doc(db, ROOMS_COLLECTION, roomId, SENSORS_SUBCOLLECTION, sensorId);
        await updateDoc(sensorDocRef, { ...data, timestamp: serverTimestamp(), lastUpdate: serverTimestamp() });
        console.log(`Air Quality sensor ${sensorId} in room ${roomId} updated.`);
    } catch (error) {
        console.error(`Error updating air quality sensor ${sensorId}:`, error);
        throw error;
    }
  },

  updateThermalImagerSensor: async (roomId: string, sensorId: string, data: Partial<Omit<ThermalImagerData, 'id' | 'name' | 'timestamp' | 'pixels'>> & { pixels?: Record<string, number[]> }): Promise<void> => {
    try {
        const sensorDocRef = doc(db, ROOMS_COLLECTION, roomId, SENSORS_SUBCOLLECTION, sensorId);
         const updatePayload: any = { ...data, timestamp: serverTimestamp(), lastUpdate: serverTimestamp() };
        if (data.pixels) {
            updatePayload.pixels = data.pixels;
        }
        await updateDoc(sensorDocRef, updatePayload);
        console.log(`Thermal Imager sensor ${sensorId} in room ${roomId} updated.`);

    } catch (error) {
        console.error(`Error updating thermal imager sensor ${sensorId}:`, error);
        throw error;
    }
  },

  updateVibrationSensor: async (roomId: string, sensorId: string, data: Partial<Omit<VibrationData, 'id' | 'name' | 'timestamp'>>): Promise<void> => {
    try {
        const sensorDocRef = doc(db, ROOMS_COLLECTION, roomId, SENSORS_SUBCOLLECTION, sensorId);
        await updateDoc(sensorDocRef, { ...data, timestamp: serverTimestamp(), lastUpdate: serverTimestamp() });
        console.log(`Vibration sensor ${sensorId} in room ${roomId} updated.`);
    } catch (error) {
        console.error(`Error updating vibration sensor ${sensorId}:`, error);
        throw error;
    }
  },
};

const hasSignificantChange = (oldData: any, newData: any, sensorType: keyof RoomSensorData): boolean => {
  if (!oldData || !newData) return true;
  const oldTimestamp = oldData.lastUpdate?.toDate?.().getTime() || oldData.timestamp?.toDate?.() || 0; // Use toDate()
  const newTimestamp = newData.lastUpdate?.toDate?.().getTime() || newData.timestamp?.toDate?.() || 0; // Use toDate()


  if (Math.abs(newTimestamp - oldTimestamp) < 1000) { // Only compare if timestamps are different by at least 1s
    // If timestamps are very close, check values to see if they actually changed
     switch (sensorType) {
        case 'tempHumidity': return oldData.temperature !== newData.temperature || oldData.humidity !== newData.humidity;
        case 'airQuality': return oldData.pm25 !== newData.pm25 || oldData.pm10 !== newData.pm10;
        case 'thermalImager': return oldData.maxTemp !== newData.maxTemp || oldData.avgTemp !== newData.avgTemp || oldData.minTemp !== newData.minTemp;
        case 'vibration': return oldData.rmsAcceleration !== newData.rmsAcceleration;
        default: return JSON.stringify(oldData) !== JSON.stringify(newData); // Fallback for other types if any
    }
  }
  // If timestamps are significantly different, assume data has changed or is new
  return true; 
};

// Default sensor data initialization - can be removed if not used
const initializeDefaultSensorData = (roomId: string, roomName: string): RoomSensorData => {
  const now = new Date();
  const createDefaultPixelMap = (): Record<string, number[]> => {
    const map: Record<string, number[]> = {};
    for (let i = 0; i < 8; i++) {
      map[String(i)] = Array(8).fill(20);
    }
    return map;
  };

  return {
    tempHumidity: {
      id: `${roomId}-th-01`,
      name: `${roomName} Environment`,
      temperature: 0, // Default values
      humidity: 0,
      status: 'normal',
      timestamp: now,
    } as TempHumidityData,
    airQuality: {
      id: `${roomId}-aq-01`,
      name: `${roomName} Air Quality`,
      pm25: 0,
      pm10: 0,
      status: 'normal',
      timestamp: now,
    } as AirQualityData,
    thermalImager: {
        id: `${roomId}-ti-01`,
        name: `${roomName} Thermal Scan`,
        pixels: createDefaultPixelMap(),
        temperatures: createDefaultPixelMap(),
        minTemp: 0,
        maxTemp: 0,
        avgTemp: 0,
        timestamp: now,
    } as ThermalImagerData,
    vibration: {
      id: `${roomId}-vib-01`,
      name: `${roomName} Vibration`,
      rmsAcceleration: 0,
      status: 'normal',
      timestamp: now,
    } as VibrationData,
  };
};