// labwatch-app/types/camera.ts

export interface TapoCameraCredentials {
  username: string;
  password: string;
  ipAddress: string;
  port?: number;
}

export interface PeopleDetectionSettings {
  enabled: boolean;
  confidenceThreshold: number; // 0-1
  detectionInterval: number; // milliseconds
  saveEvents: boolean;
  alertOnCountChange: boolean;
  maxPeopleAlert?: number;
  minPeopleAlert?: number;
  trackingEnabled: boolean;
  autoStartDetection: boolean;
}

export interface CameraConfiguration {
  id: string;
  name: string;
  roomId: string;
  type: 'tapo_cctv';
  model: string; // e.g., 'Tapo C200', 'Tapo C210', etc.
  credentials: TapoCameraCredentials;
  streamUrl?: string; // RTSP stream URL
  thumbnailUrl?: string; // Snapshot URL
  isActive: boolean;
  isRecording: boolean;
  nightVisionEnabled: boolean;
  motionDetectionEnabled: boolean;
  audioRecordingEnabled: boolean;
  peopleDetectionSettings?: PeopleDetectionSettings; // AI people detection configuration
  lastPeopleCount?: number; // Last detected people count
  lastPeopleDetection?: Date; // Last time people detection ran
  createdAt: Date;
  updatedAt: Date;
  lastConnectionTest?: Date;
  connectionStatus: 'connected' | 'disconnected' | 'unknown' | 'error';
  errorMessage?: string;
}

export interface CameraSnapshot {
  id: string;
  cameraId: string;
  roomId: string;
  imageUrl: string;
  timestamp: Date;
  motionDetected?: boolean;
  alertTriggered?: boolean;
}

export interface CameraEvent {
  id: string;
  cameraId: string;
  roomId: string;
  type: 'motion_detected' | 'recording_started' | 'recording_stopped' | 'connection_lost' | 'connection_restored' | 'people_detected' | 'people_count_changed';
  timestamp: Date;
  details?: string;
  snapshotUrl?: string;
  peopleCount?: number; // For people detection events
}

export interface CameraStreamInfo {
  rtspUrl: string;
  httpUrl?: string;
  quality: 'low' | 'medium' | 'high' | 'ultra';
  resolution: string; // e.g., '1920x1080', '1280x720'
  fps: number;
}

// Form interfaces for adding/editing cameras
export interface NewCameraConfiguration extends Omit<CameraConfiguration, 'id' | 'createdAt' | 'updatedAt' | 'lastConnectionTest' | 'connectionStatus'> {
  // All other fields are required when creating a new camera
}

export interface UpdateCameraConfiguration extends Partial<Omit<CameraConfiguration, 'id' | 'roomId' | 'createdAt'>> {
  // All fields except id, roomId, and createdAt can be updated
}

// Status types for UI displays
export type CameraConnectionStatus = 'connected' | 'disconnected' | 'unknown' | 'error';
export type CameraEventType = 'motion_detected' | 'recording_started' | 'recording_stopped' | 'connection_lost' | 'connection_restored' | 'people_detected' | 'people_count_changed';

// Default people detection settings
export const DEFAULT_PEOPLE_DETECTION_SETTINGS: PeopleDetectionSettings = {
  enabled: true,
  confidenceThreshold: 0.6,
  detectionInterval: 2000, // 2 seconds
  saveEvents: true,
  alertOnCountChange: true,
  maxPeopleAlert: 10,
  minPeopleAlert: 0,
  trackingEnabled: true,
  autoStartDetection: true
};
