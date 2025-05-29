// labwatch-app/utils/firebaseUtils.ts
import { db } from '@/FirebaseConfig'; // Ensure db is exported from your FirebaseConfig
import { Alert } from '@/types/alerts'; // Import Alert type
import { Incident, NewIncident, UpdateIncident } from '@/types/incidents'; // Adjust path if needed
import { Room } from '@/types/rooms'; // Import Room type
import { Timestamp, addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';


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
      // Recursively clean nested objects
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
    // Clean the data before sending to Firestore
    const cleanData = removeUndefinedValues(incidentData);
    
    // Security rules require reportedAt to be request.time
    // Since serverTimestamp() is used as request.time in rules
    // Let's make sure we're not trying to set it ourselves
    const docRef = await addDoc(incidentsCollection, {
      ...cleanData,
      // Make sure reportedBy is set correctly
      reportedBy: cleanData.reportedBy, // This must match auth.uid in rules
      roomId: cleanData.roomId,
      title: cleanData.title,
      description: cleanData.description,
      status: cleanData.status,
      severity: cleanData.severity,
      reportedAt: serverTimestamp(), // This matches request.time in rules
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
    // Clean the data to remove undefined values before updating
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


// --- Helper function to get rooms (you might already have this in RoomService) ---
export const getRoomsForSelector = async (): Promise<Room[]> => {
  try {
    const roomsCollection = collection(db, 'rooms'); // Assuming 'rooms' is your collection name
    const q = query(roomsCollection, where('isArchived', '!=', true), orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => convertTimestamps({ ...doc.data(), id: doc.id } as Room));
  } catch (error) {
    console.error("Error getting rooms: ", error);
    throw error;
  }
};

// --- Helper function to get alerts (you might already have this in AlertService) ---
export const getAlertsForSelector = async (): Promise<Alert[]> => {
  try {
    const alertsCollection = collection(db, 'alerts'); // Assuming 'alerts' is your collection name
    // Add any necessary filters, e.g., only non-acknowledged alerts or recent alerts
    const q = query(alertsCollection, orderBy('timestamp', 'desc')); // Example query
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => convertTimestamps({ ...doc.data(), id: doc.id } as Alert));
  } catch (error) {
    console.error("Error getting alerts: ", error);
    throw error;
  }
};