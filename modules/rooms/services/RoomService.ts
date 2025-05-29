// Modify labwatch-app/modules/rooms/services/RoomService.ts

import { db } from '@/FirebaseConfig';
import { AlertService } from '@/modules/alerts/services/AlertService';
import { Room, RoomSensorData } from '@/types/rooms';
import { AirQualityData, TempHumidityData, ThermalImagerData, VibrationData } from '@/types/sensor';
// Import convertTimestamps from the new utility file
import { convertTimestamps } from '@/utils/firebaseUtils';
import {
  addDoc,
  collection, // ADDED: For permanent deletion
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Unsubscribe,
  updateDoc,
  where, // ADDED: For querying archived rooms
  writeBatch
} from 'firebase/firestore';

export const ROOMS_COLLECTION = 'rooms';
const SENSORS_SUBCOLLECTION = 'sensors';

// Track last processed sensor data to detect actual changes
const lastProcessedSensorData = new Map<string, any>();

export const RoomService = {
  addRoom: async (roomData: { name: string; location: string; isMonitored: boolean }): Promise<string> => {
    try {
      const roomCollectionRef = collection(db, ROOMS_COLLECTION);
      const docRef = await addDoc(roomCollectionRef, {
        ...roomData,
        createdAt: serverTimestamp(),
        isArchived: false, // Initialize as not archived
      });
      console.log('Room added with ID:', docRef.id);

      const defaultSensors = initializeDefaultSensorData(docRef.id, roomData.name);
      const sensorsCollectionRef = collection(db, ROOMS_COLLECTION, docRef.id, SENSORS_SUBCOLLECTION);

      const batch = writeBatch(db);
      Object.entries(defaultSensors).forEach(([sensorType, sensorDataEntry]) => {
        const typedSensorDataEntry = sensorDataEntry as TempHumidityData | AirQualityData | ThermalImagerData | VibrationData | undefined;
        if (typedSensorDataEntry && typedSensorDataEntry.id) {
          const sensorDocRef = doc(sensorsCollectionRef, typedSensorDataEntry.id);
          batch.set(sensorDocRef, { ...typedSensorDataEntry, type: sensorType, lastUpdate: serverTimestamp() });
        }
      });
      await batch.commit();
      console.log('Default sensor data initialized for room:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("Error adding room:", error);
      throw error;
    }
  },

  getRooms: async (): Promise<Room[]> => {
    try {
      const roomsCollectionRef = collection(db, ROOMS_COLLECTION);
      // MODIFIED: Filter out archived rooms
      const q = query(roomsCollectionRef, where("isArchived", "==", false), orderBy("name", "asc"));
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
      await updateDoc(roomDocRef, updatedData);
      console.log('Room updated:', roomId);
    } catch (error) {
      console.error(`Error updating room ${roomId}:`, error);
      throw error;
    }
  },

  // FIXED: Simplified archiving with proper permissions
  archiveRoom: async (roomId: string): Promise<void> => {
    try {
      const roomDocRef = doc(db, ROOMS_COLLECTION, roomId);
      
      // Get current room data first
      const roomDoc = await getDoc(roomDocRef);
      if (!roomDoc.exists()) {
        throw new Error(`Room ${roomId} not found`);
      }
      
      const currentData = roomDoc.data();
      
      const updateData = {
        ...currentData,
        isArchived: true,
        archivedAt: serverTimestamp(),
        isMonitored: false,
      };
      
      await updateDoc(roomDocRef, updateData);
      console.log('Room archived:', roomId);
    } catch (error) {
      console.error(`Error archiving room ${roomId}:`, error);
      throw error;
    }
  },

  restoreRoom: async (roomId: string): Promise<void> => {
    try {
      const roomDocRef = doc(db, ROOMS_COLLECTION, roomId);
      
      // Get current room data first
      const roomDoc = await getDoc(roomDocRef);
      if (!roomDoc.exists()) {
        throw new Error(`Room ${roomId} not found`);
      }
      
      const currentData = roomDoc.data();
      
      // Remove archivedAt field by creating new object without it
      const { archivedAt, ...restoreData } = currentData;
      const updateData = {
        ...restoreData,
        isArchived: false,
      };
      
      await updateDoc(roomDocRef, updateData);
      console.log('Room restored:', roomId);
    } catch (error) {
      console.error(`Error restoring room ${roomId}:`, error);
      throw error;
    }
  },

  permanentlyDeleteRoom: async (roomId: string): Promise<void> => {
    try {
      const roomDocRef = doc(db, ROOMS_COLLECTION, roomId);
      const batch = writeBatch(db);
      const sensorsCollectionRef = collection(db, ROOMS_COLLECTION, roomId, SENSORS_SUBCOLLECTION);
      const sensorsSnapshot = await getDocs(sensorsCollectionRef);
      sensorsSnapshot.forEach(sensorDoc => {
        batch.delete(doc(sensorsCollectionRef, sensorDoc.id));
      });
      batch.delete(roomDocRef);
      await batch.commit();
      console.log('Room and its sensors permanently deleted:', roomId);
    } catch (error) {
      console.error(`Error permanently deleting room ${roomId}:`, error);
      throw error;
    }
  },

  getSensorsForRoom: async (roomId: string): Promise<RoomSensorData> => {
    const sensors: Partial<RoomSensorData> = {};
    try {
      const sensorsCollectionRef = collection(db, ROOMS_COLLECTION, roomId, SENSORS_SUBCOLLECTION);
      const querySnapshot = await getDocs(sensorsCollectionRef);
      querySnapshot.forEach(doc => {
        const data = doc.data();
        const sensorType = data.type as keyof RoomSensorData;
        if (sensorType) {
          sensors[sensorType] = convertTimestamps(data) as any;
        }
      });
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
    // MODIFIED: Filter out archived rooms
    const q = query(roomsCollectionRef, where("isArchived", "==", false), orderBy("name", "asc"));
    return onSnapshot(q,
        (querySnapshot) => {
            const rooms = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return convertTimestamps({
                    id: doc.id,
                    name_or_id: data.name || doc.id,
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

  onArchivedRoomsUpdate: ( // New listener for archived rooms
    onNext: (rooms: Room[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe => {
    const roomsCollectionRef = collection(db, ROOMS_COLLECTION);
    const q = query(roomsCollectionRef, where("isArchived", "==", true), orderBy("archivedAt", "desc"));
    return onSnapshot(q,
        (querySnapshot) => {
            const rooms = querySnapshot.docs.map(doc => {
                const data = doc.data();
                return convertTimestamps({
                    id: doc.id,
                    name_or_id: data.name || doc.id,
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
    roomId: string, callback: (sensors: RoomSensorData) => void, p0?: (error: any) => void  ): Unsubscribe => {
    const sensorsCollectionRef = collection(db, ROOMS_COLLECTION, roomId, SENSORS_SUBCOLLECTION);

    let roomName = `Room ${roomId}`;
    getDoc(doc(db, ROOMS_COLLECTION, roomId)).then(roomDocSnap => {
        if(roomDocSnap.exists()) {
            roomName = roomDocSnap.data().name || roomName;
        }
    }).catch(e => console.error(`Failed to fetch room name for ${roomId}: `, e));

    return onSnapshot(sensorsCollectionRef,
      (querySnapshot) => {
        const sensors: Partial<RoomSensorData> = {};

        querySnapshot.forEach(docSnapshot => {
          const data = docSnapshot.data();
          const sensorType = data.type as keyof RoomSensorData;
          const sensorId = docSnapshot.id;
          const sensorKey = `${roomId}-${sensorId}`;

          if (sensorType) {
            const liveData = convertTimestamps(data) as any;
            sensors[sensorType] = liveData;

            const lastData = lastProcessedSensorData.get(sensorKey);
            const hasDataChanged = !lastData || hasSignificantChange(lastData, liveData, sensorType);

            if (hasDataChanged) {
              console.log(`Detected data change for ${sensorType} in room ${roomId}, checking for alerts`);
              lastProcessedSensorData.set(sensorKey, { ...liveData });

              if (roomName) {
                AlertService.checkForAlerts(roomId, roomName, sensorId, sensorType, liveData)
                  .then(() => {})
                  .catch(e => console.error(`Error during AlertService.checkForAlerts for ${sensorType} in ${roomName} (Sensor ID: ${sensorId}):`, e));
              } else {
                console.warn(`roomName not yet resolved for roomId ${roomId} when processing sensor ${sensorId}. Alert message might use fallback name.`);
                AlertService.checkForAlerts(roomId, `Room ${roomId}`, sensorId, sensorType, liveData)
                  .then(() => {})
                  .catch(e => console.error(`Error during AlertService.checkForAlerts (fallback roomName) for ${sensorType} in ${roomId}:`, e));
              }
            } else {
              // console.log(`No significant change detected for ${sensorType} in room ${roomId}, skipping alert check`);
            }
          }
        });
        callback(sensors as RoomSensorData);
      },
      (error) => {
        console.error(`Firebase onSnapshot error for sensors in room ${roomId}:`, error);
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
  const oldTimestamp = oldData.lastUpdate?.getTime?.() || oldData.timestamp?.getTime?.() || 0;
  const newTimestamp = newData.lastUpdate?.getTime?.() || newData.timestamp?.getTime?.() || 0;

  if (Math.abs(newTimestamp - oldTimestamp) < 1000) {
    return false;
  }
  switch (sensorType) {
    case 'tempHumidity':
      return oldData.temperature !== newData.temperature || oldData.humidity !== newData.humidity;
    case 'airQuality':
      return oldData.pm25 !== newData.pm25 || oldData.pm10 !== newData.pm10;
    case 'thermalImager':
      return oldData.maxTemp !== newData.maxTemp || oldData.avgTemp !== newData.avgTemp || oldData.minTemp !== newData.minTemp;
    case 'vibration':
      return oldData.rmsAcceleration !== newData.rmsAcceleration;
    default:
      return true;
  }
};

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
      temperature: 50,
      humidity: 45,
      status: 'normal',
      timestamp: now,
    } as TempHumidityData,
    airQuality: {
      id: `${roomId}-aq-01`,
      name: `${roomName} Air Quality`,
      pm25: 10,
      pm10: 15,
      status: 'normal',
      timestamp: now,
    } as AirQualityData,
    thermalImager: {
        id: `${roomId}-ti-01`,
        name: `${roomName} Thermal Scan`,
        pixels: createDefaultPixelMap(),
        temperatures: createDefaultPixelMap(),
        minTemp: 20,
        maxTemp: 20,
        avgTemp: 20,
        timestamp: now,
    } as ThermalImagerData,
    vibration: {
      id: `${roomId}-vib-01`,
      name: `${roomName} Vibration`,
      rmsAcceleration: 0.1,
      status: 'normal',
      timestamp: now,
    } as VibrationData,
  };
};

export { convertTimestamps };

