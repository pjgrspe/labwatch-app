// labwatch-app/modules/cameras/services/CameraService.ts
import { db } from '@/FirebaseConfig';
import { CameraConfiguration, CameraEvent, CameraSnapshot, NewCameraConfiguration, UpdateCameraConfiguration } from '@/types/camera';
import { PeopleCountHistory, PeopleDetectionEvent } from '@/types/peopleDetection';
import { convertTimestamps } from '@/utils/firebaseUtils';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Unsubscribe,
  updateDoc,
  where
} from 'firebase/firestore';

export const CAMERAS_COLLECTION = 'cameras';
export const CAMERA_EVENTS_COLLECTION = 'camera_events';
export const CAMERA_SNAPSHOTS_COLLECTION = 'camera_snapshots';
export const PEOPLE_DETECTION_EVENTS_COLLECTION = 'people_detection_events';
export const PEOPLE_COUNT_HISTORY_COLLECTION = 'people_count_history';

export const CameraService = {
  // --- Camera Configuration CRUD Operations ---
  
  addCamera: async (cameraData: NewCameraConfiguration): Promise<string> => {
    try {
      const cameraCollectionRef = collection(db, CAMERAS_COLLECTION);
      const docRef = await addDoc(cameraCollectionRef, {
        ...cameraData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        connectionStatus: 'unknown',
      });
      console.log('Camera added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("Error adding camera:", error);
      throw error;
    }
  },

  getCameraById: async (cameraId: string): Promise<CameraConfiguration | null> => {
    try {
      const cameraDocRef = doc(db, CAMERAS_COLLECTION, cameraId);
      const docSnap = await getDoc(cameraDocRef);
      if (docSnap.exists()) {
        return convertTimestamps({ id: docSnap.id, ...docSnap.data() }) as CameraConfiguration;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching camera ${cameraId}:`, error);
      throw error;
    }
  },

  getCamerasForRoom: async (roomId: string): Promise<CameraConfiguration[]> => {
    try {
      const cameraCollectionRef = collection(db, CAMERAS_COLLECTION);
      // Remove orderBy to avoid requiring composite index, sort in JS instead
      const q = query(cameraCollectionRef, where("roomId", "==", roomId));
      const querySnapshot = await getDocs(q);
      const cameras = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return convertTimestamps({
          id: doc.id,
          ...data
        }) as CameraConfiguration;
      });
      // Sort by name in JavaScript
      return cameras.sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error(`Error fetching cameras for room ${roomId}:`, error);
      throw error;
    }
  },

  getAllCameras: async (): Promise<CameraConfiguration[]> => {
    try {
      const cameraCollectionRef = collection(db, CAMERAS_COLLECTION);
      const q = query(cameraCollectionRef, orderBy("name", "asc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return convertTimestamps({
          id: doc.id,
          ...data
        }) as CameraConfiguration;
      });
    } catch (error) {
      console.error("Error fetching all cameras:", error);
      throw error;
    }
  },

  updateCamera: async (cameraId: string, updatedData: UpdateCameraConfiguration): Promise<void> => {
    try {
      const cameraDocRef = doc(db, CAMERAS_COLLECTION, cameraId);
      await updateDoc(cameraDocRef, {
        ...updatedData,
        updatedAt: serverTimestamp(),
      });
      console.log('Camera updated:', cameraId);
    } catch (error) {
      console.error(`Error updating camera ${cameraId}:`, error);
      throw error;
    }
  },

  deleteCamera: async (cameraId: string): Promise<void> => {
    try {
      const cameraDocRef = doc(db, CAMERAS_COLLECTION, cameraId);
      await deleteDoc(cameraDocRef);
      console.log('Camera deleted:', cameraId);
    } catch (error) {
      console.error(`Error deleting camera ${cameraId}:`, error);
      throw error;
    }
  },

  // --- Real-time listeners ---

  onCamerasUpdate: (
    roomId: string,
    onNext: (cameras: CameraConfiguration[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe => {
    const cameraCollectionRef = collection(db, CAMERAS_COLLECTION);
    // Remove orderBy to avoid requiring composite index, sort in JS instead
    const q = query(cameraCollectionRef, where("roomId", "==", roomId));
    
    return onSnapshot(q,
      (querySnapshot) => {
        const cameras = querySnapshot.docs.map(docSnapshot => {
          const data = docSnapshot.data();
          return convertTimestamps({
            id: docSnapshot.id,
            ...data
          }) as CameraConfiguration;
        });
        // Sort by name in JavaScript
        const sortedCameras = cameras.sort((a, b) => a.name.localeCompare(b.name));
        onNext(sortedCameras);
      },
      (error) => {
        console.error(`Error listening to camera updates for room ${roomId}:`, error);
        if (onError) {
          onError(error);
        }
      }
    );
  },

  onAllCamerasUpdate: (
    onNext: (cameras: CameraConfiguration[]) => void,
    onError?: (error: Error) => void
  ): Unsubscribe => {
    const cameraCollectionRef = collection(db, CAMERAS_COLLECTION);
    const q = query(cameraCollectionRef, orderBy("name", "asc"));
    
    return onSnapshot(q,
      (querySnapshot) => {
        const cameras = querySnapshot.docs.map(docSnapshot => {
          const data = docSnapshot.data();
          return convertTimestamps({
            id: docSnapshot.id,
            ...data
          }) as CameraConfiguration;
        });
        onNext(cameras);
      },
      (error) => {
        console.error("Error listening to all camera updates:", error);
        if (onError) {
          onError(error);
        }
      }
    );
  },

  onCameraUpdate: (
    cameraId: string,
    onNext: (camera: CameraConfiguration | null) => void,
    onError?: (error: Error) => void
  ): Unsubscribe => {
    const cameraDocRef = doc(db, CAMERAS_COLLECTION, cameraId);
    
    return onSnapshot(cameraDocRef,
      (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          const camera = convertTimestamps({
            id: docSnapshot.id,
            ...data
          }) as CameraConfiguration;
          onNext(camera);
        } else {
          onNext(null);
        }
      },
      (error) => {
        console.error(`Error listening to camera ${cameraId} updates:`, error);
        if (onError) {
          onError(error);
        }
      }
    );
  },

  // --- Camera Connection Testing ---

  testCameraConnection: async (cameraId: string): Promise<boolean> => {
    try {
      // Try to connect to the camera's HTTP port as a basic reachability check
      const camera = await CameraService.getCameraById(cameraId);
      if (!camera) {
        throw new Error('Camera not found');
      }
      const { ipAddress, username, password, port } = camera.credentials;
      let isConnected = false;
      try {
        // Try to fetch the camera's web UI (basic check)
        const response = await fetch(`http://${ipAddress}:${port || 80}`, {
          method: 'GET',
          headers: {
            'Authorization': 'Basic ' + btoa(`${username}:${password}`),
          },
        });
        isConnected = response.ok;
      } catch (err) {
        isConnected = false;
      }
      const updateData: any = {
        connectionStatus: isConnected ? 'connected' : 'disconnected',
        lastConnectionTest: new Date(),
      };
      if (!isConnected) {
        updateData.errorMessage = 'Camera not reachable';
      } else {
        updateData.errorMessage = null;
      }
      await CameraService.updateCamera(cameraId, updateData);
      return isConnected;
    } catch (error) {
      console.error(`Error testing camera connection ${cameraId}:`, error);
      const updateData: any = {
        connectionStatus: 'error',
        lastConnectionTest: new Date(),
      };
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      if (errorMsg) {
        updateData.errorMessage = errorMsg;
      }
      await CameraService.updateCamera(cameraId, updateData);
      return false;
    }
  },

  // --- Camera Events ---

  addCameraEvent: async (eventData: Omit<CameraEvent, 'id' | 'timestamp'>): Promise<string> => {
    try {
      const eventsCollectionRef = collection(db, CAMERA_EVENTS_COLLECTION);
      const docRef = await addDoc(eventsCollectionRef, {
        ...eventData,
        timestamp: serverTimestamp(),
      });
      console.log('Camera event added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("Error adding camera event:", error);
      throw error;
    }
  },

  getCameraEvents: async (cameraId: string, limitCount: number = 50): Promise<CameraEvent[]> => {
    try {
      const eventsCollectionRef = collection(db, CAMERA_EVENTS_COLLECTION);
      const q = query(
        eventsCollectionRef,
        where("cameraId", "==", cameraId),
        orderBy("timestamp", "desc"),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        return convertTimestamps({ id: doc.id, ...doc.data() }) as CameraEvent;
      });
    } catch (error) {
      console.error(`Error fetching camera events for ${cameraId}:`, error);
      throw error;
    }
  },

  // --- Camera Snapshots ---

  addCameraSnapshot: async (snapshotData: Omit<CameraSnapshot, 'id' | 'timestamp'>): Promise<string> => {
    try {
      const snapshotsCollectionRef = collection(db, CAMERA_SNAPSHOTS_COLLECTION);
      const docRef = await addDoc(snapshotsCollectionRef, {
        ...snapshotData,
        timestamp: serverTimestamp(),
      });
      console.log('Camera snapshot added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("Error adding camera snapshot:", error);
      throw error;
    }
  },

  getCameraSnapshots: async (cameraId: string, limitCount: number = 20): Promise<CameraSnapshot[]> => {
    try {
      const snapshotsCollectionRef = collection(db, CAMERA_SNAPSHOTS_COLLECTION);
      const q = query(
        snapshotsCollectionRef,
        where("cameraId", "==", cameraId),
        orderBy("timestamp", "desc"),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        return convertTimestamps({ id: doc.id, ...doc.data() }) as CameraSnapshot;
      });
    } catch (error) {
      console.error(`Error fetching camera snapshots for ${cameraId}:`, error);
      throw error;
    }
  },

  // --- Camera Control Functions (for future Tapo API integration) ---

  startRecording: async (cameraId: string): Promise<void> => {
    try {
      // In a real implementation, this would send commands to the Tapo camera
      await CameraService.updateCamera(cameraId, { isRecording: true });
      await CameraService.addCameraEvent({
        cameraId,
        roomId: '', // Would need to be fetched from camera config
        type: 'recording_started',
        details: 'Recording started via app',
      });
    } catch (error) {
      console.error(`Error starting recording for camera ${cameraId}:`, error);
      throw error;
    }
  },

  stopRecording: async (cameraId: string): Promise<void> => {
    try {
      // In a real implementation, this would send commands to the Tapo camera
      await CameraService.updateCamera(cameraId, { isRecording: false });
      await CameraService.addCameraEvent({
        cameraId,
        roomId: '', // Would need to be fetched from camera config
        type: 'recording_stopped',
        details: 'Recording stopped via app',
      });
    } catch (error) {
      console.error(`Error stopping recording for camera ${cameraId}:`, error);
      throw error;
    }
  },

  toggleNightVision: async (cameraId: string, enabled: boolean): Promise<void> => {
    try {
      // In a real implementation, this would send commands to the Tapo camera
      await CameraService.updateCamera(cameraId, { nightVisionEnabled: enabled });
    } catch (error) {
      console.error(`Error toggling night vision for camera ${cameraId}:`, error);
      throw error;
    }
  },

  // --- People Detection Events ---

  addPeopleDetectionEvent: async (eventData: Omit<PeopleDetectionEvent, 'id' | 'timestamp'>): Promise<string> => {
    try {
      const eventsCollectionRef = collection(db, PEOPLE_DETECTION_EVENTS_COLLECTION);
      const docRef = await addDoc(eventsCollectionRef, {
        ...eventData,
        timestamp: serverTimestamp(),
      });
      console.log('People detection event added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("Error adding people detection event:", error);
      throw error;
    }
  },

  getPeopleDetectionEvents: async (
    cameraId: string, 
    limitCount: number = 50,
    eventTypes?: ('person_entered' | 'person_exited' | 'count_changed')[]
  ): Promise<PeopleDetectionEvent[]> => {
    try {
      const eventsCollectionRef = collection(db, PEOPLE_DETECTION_EVENTS_COLLECTION);
      let q = query(
        eventsCollectionRef,
        where("cameraId", "==", cameraId),
        orderBy("timestamp", "desc"),
        limit(limitCount)
      );

      // Add event type filter if specified
      if (eventTypes && eventTypes.length > 0) {
        q = query(
          eventsCollectionRef,
          where("cameraId", "==", cameraId),
          where("eventType", "in", eventTypes),
          orderBy("timestamp", "desc"),
          limit(limitCount)
        );
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        return convertTimestamps({ id: doc.id, ...doc.data() }) as PeopleDetectionEvent;
      });
    } catch (error) {
      console.error(`Error fetching people detection events for ${cameraId}:`, error);
      throw error;
    }
  },

  getPeopleDetectionEventsByRoom: async (
    roomId: string, 
    limitCount: number = 100
  ): Promise<PeopleDetectionEvent[]> => {
    try {
      const eventsCollectionRef = collection(db, PEOPLE_DETECTION_EVENTS_COLLECTION);
      const q = query(
        eventsCollectionRef,
        where("roomId", "==", roomId),
        orderBy("timestamp", "desc"),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        return convertTimestamps({ id: doc.id, ...doc.data() }) as PeopleDetectionEvent;
      });
    } catch (error) {
      console.error(`Error fetching people detection events for room ${roomId}:`, error);
      throw error;
    }
  },

  // --- People Count History ---

  addPeopleCountHistory: async (historyData: Omit<PeopleCountHistory, 'id' | 'timestamp'>): Promise<string> => {
    try {
      const historyCollectionRef = collection(db, PEOPLE_COUNT_HISTORY_COLLECTION);
      const docRef = await addDoc(historyCollectionRef, {
        ...historyData,
        timestamp: serverTimestamp(),
      });
      console.log('People count history added with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("Error adding people count history:", error);
      throw error;
    }
  },

  getPeopleCountHistory: async (
    cameraId: string, 
    timeRangeHours: number = 24,
    limitCount: number = 1000
  ): Promise<PeopleCountHistory[]> => {
    try {
      const historyCollectionRef = collection(db, PEOPLE_COUNT_HISTORY_COLLECTION);
      const startTime = new Date(Date.now() - timeRangeHours * 60 * 60 * 1000);
      
      const q = query(
        historyCollectionRef,
        where("cameraId", "==", cameraId),
        where("timestamp", ">=", startTime),
        orderBy("timestamp", "desc"),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        return convertTimestamps({ id: doc.id, ...doc.data() }) as PeopleCountHistory;
      });
    } catch (error) {
      console.error(`Error fetching people count history for ${cameraId}:`, error);
      throw error;
    }
  },

  getRoomOccupancyHistory: async (
    roomId: string, 
    timeRangeHours: number = 24
  ): Promise<PeopleCountHistory[]> => {
    try {
      const historyCollectionRef = collection(db, PEOPLE_COUNT_HISTORY_COLLECTION);
      const startTime = new Date(Date.now() - timeRangeHours * 60 * 60 * 1000);
      
      const q = query(
        historyCollectionRef,
        where("roomId", "==", roomId),
        where("timestamp", ">=", startTime),
        orderBy("timestamp", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        return convertTimestamps({ id: doc.id, ...doc.data() }) as PeopleCountHistory;
      });
    } catch (error) {
      console.error(`Error fetching room occupancy history for ${roomId}:`, error);
      throw error;
    }
  },

  // Real-time listeners for people detection
  onPeopleDetectionEventsUpdate: (
    cameraId: string,
    onNext: (events: PeopleDetectionEvent[]) => void,
    onError?: (error: Error) => void,
    limitCount: number = 20
  ): Unsubscribe => {
    const eventsCollectionRef = collection(db, PEOPLE_DETECTION_EVENTS_COLLECTION);
    const q = query(
      eventsCollectionRef,
      where("cameraId", "==", cameraId),
      orderBy("timestamp", "desc"),
      limit(limitCount)
    );
    
    return onSnapshot(q,
      (querySnapshot) => {
        const events = querySnapshot.docs.map(docSnapshot => {
          const data = docSnapshot.data();
          return convertTimestamps({
            id: docSnapshot.id,
            ...data
          }) as PeopleDetectionEvent;
        });
        onNext(events);
      },
      (error) => {
        console.error(`Error listening to people detection events for camera ${cameraId}:`, error);
        if (onError) {
          onError(error);
        }
      }
    );
  },

  getCurrentRoomOccupancy: async (roomId: string): Promise<{ totalCount: number; cameras: { cameraId: string; count: number }[] }> => {
    try {
      // Get all cameras in the room
      const cameras = await CameraService.getCamerasForRoom(roomId);
      
      let totalCount = 0;
      const cameraOccupancy: { cameraId: string; count: number }[] = [];

      // Get the latest people count for each camera
      for (const camera of cameras) {
        try {
          const recentEvents = await CameraService.getPeopleDetectionEvents(camera.id, 1);
          const latestCount = recentEvents.length > 0 ? recentEvents[0].currentCount : 0;
          
          totalCount += latestCount;
          cameraOccupancy.push({
            cameraId: camera.id,
            count: latestCount
          });
        } catch (error) {
          console.error(`Error getting count for camera ${camera.id}:`, error);
          cameraOccupancy.push({
            cameraId: camera.id,
            count: 0
          });
        }
      }

      return {
        totalCount,
        cameras: cameraOccupancy
      };
    } catch (error) {
      console.error(`Error getting current room occupancy for room ${roomId}:`, error);
      throw error;
    }
  },

  // --- Utility functions ---

  generateStreamUrl: (camera: CameraConfiguration): string => {
    // Generate RTSP stream URL for Tapo cameras
    const { credentials } = camera;
    return `rtsp://${credentials.username}:${credentials.password}@${credentials.ipAddress}:${credentials.port || 554}/stream1`;
  },

  generateSnapshotUrl: (camera: CameraConfiguration): string => {
  // Use local snapshot proxy that grabs a real JPEG via FFmpeg from RTSP
  // Proxy default: http://<HOST_PC_IP>:8080/snapshot?ip=...&port=554&user=...&pass=...&path=stream1
  const { credentials } = camera;
  const host = process.env.SNAPSHOT_PROXY_HOST || '192.168.100.14'; // Use development machine IP
  const port = process.env.SNAPSHOT_PROXY_PORT || '8080';
  const ip = encodeURIComponent(credentials.ipAddress);
  const user = credentials.username ? encodeURIComponent(credentials.username) : '';
  const pass = credentials.password ? encodeURIComponent(credentials.password) : '';
  const path = 'stream1';
  const authParams = user && pass ? `&user=${user}&pass=${pass}` : '';
  return `http://${host}:${port}/snapshot?ip=${ip}&port=${credentials.port || 554}&path=${path}${authParams}`;
  },

  generateHLSUrl: (camera: CameraConfiguration): string => {
    // Generate HLS stream URL via MediaMTX proxy
    // MediaMTX converts RTSP to HLS at http://PC_IP:8888/CAMERA_NAME/index.m3u8
    const cameraName = camera.name.toLowerCase().replace(/\s+/g, '_'); // Convert to URL-safe name
    return `http://192.168.100.14:8888/${cameraName}/index.m3u8`;
  },
};
