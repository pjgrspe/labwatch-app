// labwatch-app/utils/firebaseUtils.ts
import { app, db } from '@/FirebaseConfig'; // Ensure app and db are exported
import { Alert } from '@/types/alerts';
import { Incident, NewIncident, UpdateIncident } from '@/types/incidents';
import { Room } from '@/types/rooms';
import { Timestamp, addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';

// --- START: Added for Realtime Database ESP32 ID fetching ---
import { child, getDatabase, get as getRTDB, ref as rtdbRef } from "firebase/database";

export interface Esp32Device {
  id: string;   // This will be the ESP32_DEVICE_ID
  name: string; // For display, will also be the ESP32_DEVICE_ID
}

export const getAvailableEsp32DeviceIds = async (): Promise<Esp32Device[]> => {
  try {
    // Ensure 'app' is correctly initialized and firebaseConfig in APIkeys.ts includes 'databaseURL'
    const rtdb = getDatabase(app); // 'app' is imported from FirebaseConfig
    const devicesRefPath = 'esp32_devices_data';
    const devicesNodeRef = child(rtdbRef(rtdb), devicesRefPath);
    
    const snapshot = await getRTDB(devicesNodeRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      // Extract keys (device IDs) from the snapshot
      return Object.keys(data).map(deviceId => ({
        id: deviceId,
        name: deviceId // Use the ID as the name for display
      }));
    }
    return [];
  } catch (error) {
    console.error("Error fetching ESP32 device IDs from RTDB:", error);
    return []; 
  }
};
// --- END: Added for Realtime Database ESP32 ID fetching ---


export const convertTimestamps = (data: any): any => {
  if (data === null || typeof data !== 'object') {
    return data;
  }
  if (data instanceof Timestamp) {
    return data.toDate();
  }
  if (Array.isArray(data)) {
    return data.map(item => convertTimestamps(item));
  }
  const converted: { [key: string]: any } = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      converted[key] = convertTimestamps(data[key]);
    }
  }
  return converted;
};

// --- Incident Functions ---

const incidentsCollection = collection(db, 'incidents');

export const removeUndefinedValues = (obj: Record<string, any>): Record<string, any> => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        acc[key] = removeUndefinedValues(value);
      } else {
        acc[key] = value;
      }
    }
    return acc;
  }, {} as Record<string, any>);
};

export const addIncident = async (incidentData: NewIncident): Promise<string> => {
  try {
    const cleanData = removeUndefinedValues(incidentData);
    const docRef = await addDoc(incidentsCollection, {
      ...cleanData,
      reportedBy: cleanData.reportedBy, 
      roomId: cleanData.roomId,
      title: cleanData.title,
      description: cleanData.description,
      status: cleanData.status,
      severity: cleanData.severity,
      reportedAt: serverTimestamp(), 
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding incident: ", error);
    throw error;
  }
};

export const getIncidents = async (): Promise<Incident[]> => {
  try {
    const q = query(incidentsCollection, orderBy('reportedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => convertTimestamps({ ...doc.data(), id: doc.id } as Incident));
  } catch (error) {
    console.error("Error getting incidents: ", error);
    throw error;
  }
};

export const getIncidentById = async (id: string): Promise<Incident | null> => {
  try {
    const docRef = doc(db, 'incidents', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return convertTimestamps({ ...docSnap.data(), id: docSnap.id } as Incident);
    }
    return null;
  } catch (error) {
    console.error("Error getting incident by ID: ", error);
    throw error;
  }
};

export const updateIncident = async (id: string, updates: UpdateIncident): Promise<void> => {
  try {
    const cleanUpdates = removeUndefinedValues(updates);
    const docRef = doc(db, 'incidents', id);
    await updateDoc(docRef, {
        ...cleanUpdates,
        updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating incident: ", error);
    throw error;
  }
};

export const deleteIncident = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'incidents', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting incident: ", error);
    throw error;
  }
};

export const getRoomsForSelector = async (): Promise<Room[]> => {
  try {
    const roomsCollection = collection(db, 'rooms'); 
    const q = query(roomsCollection, where('isArchived', '!=', true), orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => convertTimestamps({ ...doc.data(), id: doc.id } as Room));
  } catch (error) {
    console.error("Error getting rooms: ", error);
    throw error;
  }
};

export const getAlertsForSelector = async (): Promise<Alert[]> => {
  try {
    const alertsCollection = collection(db, 'alerts'); 
    const q = query(alertsCollection, orderBy('timestamp', 'desc')); 
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => convertTimestamps({ ...doc.data(), id: doc.id } as Alert));
  } catch (error) {
    console.error("Error getting alerts: ", error);
    throw error;
  }
};